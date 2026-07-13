package com.hussein.booky.service.impl;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.service.EmailService;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessHoursRepository;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookyServiceRepository bookyServiceRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final EmailService emailService;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            BookyServiceRepository bookyServiceRepository,
            BusinessHoursRepository businessHoursRepository,
            EmailService emailService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.bookyServiceRepository = bookyServiceRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.emailService = emailService;
    }
    @Override
    public BookingResponse createBooking(BookingRequest request, Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BookyService service = bookyServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        validateAvailability(request, service);

        Booking booking = new Booking();
        booking.setAppointmentTime(request.getAppointmentTime());
        booking.setStatus("PENDING");
        booking.setUser(user);
        booking.setService(service);

       Booking savedBooking =
        bookingRepository.save(booking);

emailService.sendNewBookingToAdmins(
        savedBooking
);

return mapToResponse(savedBooking);
    }

    private void validateAvailability(BookingRequest request, BookyService service) {

        Integer businessId = service.getBusiness().getId();

        LocalDateTime startDateTime = request.getAppointmentTime();
        LocalDateTime endDateTime = startDateTime.plusMinutes(service.getDurationMinutes());

        DayOfWeek dayOfWeek = startDateTime.getDayOfWeek();
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();

        BusinessHours hours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(businessId, dayOfWeek)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Business hours are not set for this day"
                ));

        if (hours.isClosed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Business is closed on this day");
        }

        if (startTime.isBefore(hours.getOpenTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking time is before business opening time");
        }

        if (endTime.isAfter(hours.getCloseTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service exceeds business closing time");
        }

        List<Booking> activeBookings = bookingRepository.findActiveBookingsByBusinessId(businessId);

        for (Booking existingBooking : activeBookings) {

            LocalDateTime existingStart = existingBooking.getAppointmentTime();
            LocalDateTime existingEnd = existingStart.plusMinutes(
                    existingBooking.getService().getDurationMinutes()
            );

            boolean overlaps =
                    startDateTime.isBefore(existingEnd) &&
                    endDateTime.isAfter(existingStart);

            if (overlaps) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already booked");
            }
        }
    }

    @Override
    public List<BookingResponse> getBookingsByUser(Integer userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse cancelBooking(Integer bookingId, Integer userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to cancel this booking");
        }

        booking.setStatus("CANCELLED");

        Booking updatedBooking = bookingRepository.save(booking);

        return mapToResponse(updatedBooking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse acceptBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus("CONFIRMED");

       booking.setStatus("CONFIRMED");

Booking savedBooking =
        bookingRepository.save(booking);

emailService.sendApprovedBookingToOwner(
        savedBooking
);

return mapToResponse(savedBooking);
    }

   @Override
public BookingResponse declineBooking(Integer bookingId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking not found"
            ));

    if (!"PENDING".equals(booking.getStatus())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only pending bookings can be declined"
        );
    }

    booking.setStatus("CANCELLED");

    Booking updatedBooking =
            bookingRepository.save(booking);

    emailService.sendDeclinedBookingToOwner(
            updatedBooking
    );

    return mapToResponse(updatedBooking);
}

    @Override
    public List<BookingResponse> getBookingsByOwner(Integer ownerId) {
        return bookingRepository.findBookingsByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private BookingResponse mapToResponse(Booking booking) {

        BookyService service = booking.getService();

        return new BookingResponse(
                booking.getId(),
                booking.getAppointmentTime(),
                booking.getStatus(),

                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? booking.getUser().getFullName() : null,
                booking.getUser() != null ? booking.getUser().getEmail() : null,

                service != null ? service.getId() : null,
                service != null ? service.getName() : null,
                service != null ? service.getPrice() : null,
                service != null ? service.getDurationMinutes() : null,

                service != null && service.getBusiness() != null ? service.getBusiness().getId() : null,
                service != null && service.getBusiness() != null ? service.getBusiness().getName() : null,
                service != null && service.getBusiness() != null ? service.getBusiness().getLocation() : null
        );
    }
}