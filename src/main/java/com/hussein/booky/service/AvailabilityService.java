package com.hussein.booky.service;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessHoursRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilityService {

    private final BookyServiceRepository bookyServiceRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final BookingRepository bookingRepository;

    public AvailabilityService(BookyServiceRepository bookyServiceRepository,
                               BusinessHoursRepository businessHoursRepository,
                               BookingRepository bookingRepository) {
        this.bookyServiceRepository = bookyServiceRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<String> getAvailableSlots(Integer serviceId, LocalDate date) {

        BookyService service = bookyServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Integer businessId = service.getBusiness().getId();

        BusinessHours hours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(businessId, date.getDayOfWeek())
                .orElseThrow(() -> new RuntimeException("Business hours are not set for this day"));

        if (hours.isClosed()) {
            return List.of();
        }

        List<Booking> bookings = bookingRepository.findBookingsForDate(businessId, date);

        List<String> slots = new ArrayList<>();

        LocalTime current = hours.getOpenTime();
        LocalTime closing = hours.getCloseTime();

        while (!current.plusMinutes(service.getDurationMinutes()).isAfter(closing)) {

            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(service.getDurationMinutes());

            boolean conflict = bookings.stream().anyMatch(existing -> {
                LocalTime existingStart = existing.getAppointmentTime().toLocalTime();
                LocalTime existingEnd = existingStart.plusMinutes(
                        existing.getService().getDurationMinutes()
                );

                return slotStart.isBefore(existingEnd) && slotEnd.isAfter(existingStart);
            });

            if (!conflict) {
                slots.add(slotStart.toString());
            }

            current = current.plusMinutes(service.getDurationMinutes());
        }

        return slots;
    }
}