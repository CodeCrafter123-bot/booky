package com.hussein.booky.service;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessHoursRepository;
import com.hussein.booky.util.BookyTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilityService {

    private final BookyServiceRepository bookyServiceRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final BookingRepository bookingRepository;

    public AvailabilityService(
            BookyServiceRepository bookyServiceRepository,
            BusinessHoursRepository businessHoursRepository,
            BookingRepository bookingRepository
    ) {
        this.bookyServiceRepository = bookyServiceRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableSlots(
            Integer serviceId,
            LocalDate date
    ) {
        if (serviceId == null || serviceId <= 0 || date == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid service ID and date are required"
            );
        }

        BookyService service = bookyServiceRepository
                .findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service not found"
                ));

        if (!Boolean.TRUE.equals(service.getActive())) {
            return List.of();
        }

        if (date.isBefore(BookyTime.today())) {
            return List.of();
        }

        Integer duration = service.getDurationMinutes();

        if (duration == null || duration <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service duration must be positive"
            );
        }

        Integer businessId = service.getBusiness().getId();

        BusinessHours hours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(
                        businessId,
                        date.getDayOfWeek()
                )
                .orElse(null);

        if (hours == null || hours.isClosed()) {
            return List.of();
        }

        if (hours.getOpenTime() == null
                || hours.getCloseTime() == null
                || !hours.getOpenTime().isBefore(hours.getCloseTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Business hours are invalid"
            );
        }

        // Include active bookings across dates so any existing
        // appointment crossing midnight is also considered.
        List<Booking> bookings =
                bookingRepository.findActiveBookingsByBusinessId(businessId);

        List<String> slots = new ArrayList<>();

        LocalDateTime current = date.atTime(hours.getOpenTime());
        LocalDateTime closing = date.atTime(hours.getCloseTime());

        // LocalDateTime advances into the next date instead of wrapping
        // around to the beginning of the same day.
        while (!current.plusMinutes(duration).isAfter(closing)) {
            LocalDateTime slotStart = current;
            LocalDateTime slotEnd = current.plusMinutes(duration);

            if (BookyTime.isFuture(slotStart)) {
                boolean conflict = bookings.stream().anyMatch(existing -> {
                    LocalDateTime existingStart =
                            existing.getAppointmentTime();

                    LocalDateTime existingEnd = existingStart.plusMinutes(
                            existing.getService().getDurationMinutes()
                    );

                    return slotStart.isBefore(existingEnd)
                            && slotEnd.isAfter(existingStart);
                });

                if (!conflict) {
                    slots.add(slotStart.toLocalTime().toString());
                }
            }

            current = current.plusMinutes(duration);
        }

        return slots;
    }
}