package com.hussein.booky.service.impl;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.entity.User;
import com.hussein.booky.util.BookyTime;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessHoursRepository;
import com.hussein.booky.repository.BusinessRepository;
import com.hussein.booky.repository.UserRepository;

import com.hussein.booky.service.BookingService;
import com.hussein.booky.service.EmailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log =
            LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookyServiceRepository bookyServiceRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final BusinessRepository businessRepository;
    private final EmailService emailService;
    private final TransactionTemplate bookingTransaction;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            BookyServiceRepository bookyServiceRepository,
            BusinessHoursRepository businessHoursRepository,
            BusinessRepository businessRepository,
            EmailService emailService,
            PlatformTransactionManager transactionManager
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.bookyServiceRepository = bookyServiceRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.businessRepository = businessRepository;
        this.emailService = emailService;

        this.bookingTransaction =
                new TransactionTemplate(transactionManager);

        // Availability queries see newly committed bookings after waiting
        // for another request to release the business lock.
        this.bookingTransaction.setIsolationLevel(
                TransactionDefinition.ISOLATION_READ_COMMITTED
        );
    }

    @Override
    public BookingResponse createBooking(
            BookingRequest request,
            Integer userId
    ) {
        BookingChange change = Objects.requireNonNull(
                bookingTransaction.execute(transactionStatus -> {

                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "User not found"
                            ));

                    BookyService service = bookyServiceRepository
                            .findById(request.getServiceId())
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Service not found"
                            ));

                    // Every booking creation for this business must
                    // acquire this lock before checking availability.
                    businessRepository.findByIdForUpdate(
                            service.getBusiness().getId()
                    ).orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Business not found"
                    ));

                    validateAvailability(request, service);

                    Booking booking = new Booking();
                    booking.setAppointmentTime(request.getAppointmentTime());
                    booking.setStatus("PENDING");
                    booking.setUser(user);
                    booking.setService(service);

                    return saveChange(booking);
                })
        );

        // The transaction has committed and released its locks.
        notifySafely(
                () -> emailService.sendNewBookingToAdmins(change.booking()),
                change.booking().getId()
        );

        return change.response();
    }

    private void validateAvailability(
            BookingRequest request,
            BookyService service
    ) {
        LocalDateTime start = request.getAppointmentTime();
        Integer duration = service.getDurationMinutes();

       if (!BookyTime.isFuture(start)) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Appointment must be a valid future time in Lebanon"
    );
}
        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This service is not available for booking"
            );
        }

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
                        start.getDayOfWeek()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Business hours are not set for this day"
                ));

        if (hours.isClosed()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Business is closed on this day"
            );
        }

        if (hours.getOpenTime() == null
                || hours.getCloseTime() == null
                || !hours.getOpenTime().isBefore(hours.getCloseTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Business hours are invalid"
            );
        }

        LocalDateTime end = start.plusMinutes(duration);

        LocalDateTime opening =
                start.toLocalDate().atTime(hours.getOpenTime());

        LocalDateTime closing =
                start.toLocalDate().atTime(hours.getCloseTime());

        if (start.isBefore(opening)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking time is before business opening time"
            );
        }

        // Date-aware comparison also rejects services ending
        // after midnight when the business closes the same day.
        if (end.isAfter(closing)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service exceeds business closing time"
            );
        }

        List<Booking> activeBookings =
                bookingRepository.findActiveBookingsByBusinessId(businessId);

        for (Booking existing : activeBookings) {
            LocalDateTime existingStart = existing.getAppointmentTime();

            LocalDateTime existingEnd = existingStart.plusMinutes(
                    existing.getService().getDurationMinutes()
            );

            boolean overlaps =
                    start.isBefore(existingEnd)
                    && end.isAfter(existingStart);

            if (overlaps) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This time slot is already booked"
                );
            }
        }
    }

    @Override
    public BookingResponse acceptBooking(Integer bookingId) {
        BookingChange change = Objects.requireNonNull(
                bookingTransaction.execute(transactionStatus -> {
                    Booking booking = getLockedBooking(bookingId);

                    requirePending(booking, "accepted");

                    booking.setStatus("CONFIRMED");

                    return saveChange(booking);
                })
        );

        notifySafely(
                () -> emailService.sendApprovedBookingToOwner(
                        change.booking()
                ),
                bookingId
        );

        return change.response();
    }

    @Override
    public BookingResponse declineBooking(Integer bookingId) {
        BookingChange change = Objects.requireNonNull(
                bookingTransaction.execute(transactionStatus -> {
                    Booking booking = getLockedBooking(bookingId);

                    requirePending(booking, "declined");

                    booking.setStatus("CANCELLED");

                    return saveChange(booking);
                })
        );

        notifySafely(
                () -> emailService.sendDeclinedBookingToOwner(
                        change.booking()
                ),
                bookingId
        );

        return change.response();
    }

    @Override
    public BookingResponse cancelBooking(
            Integer bookingId,
            Integer userId
    ) {
        BookingChange change = Objects.requireNonNull(
                bookingTransaction.execute(transactionStatus -> {
                    Booking booking = getLockedBooking(bookingId);

                    if (booking.getUser() == null
                            || !booking.getUser().getId().equals(userId)) {

                        throw new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "You are not allowed to cancel this booking"
                        );
                    }

                    if (!"PENDING".equals(booking.getStatus())
                            && !"CONFIRMED".equals(booking.getStatus())) {

                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Only pending or confirmed bookings can be cancelled"
                        );
                    }

                    booking.setStatus("CANCELLED");

                    return saveChange(booking);
                })
        );

        return change.response();
    }

    private Booking getLockedBooking(Integer bookingId) {
        return bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));
    }

    private void requirePending(Booking booking, String action) {
        if (!"PENDING".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending bookings can be " + action
            );
        }
    }

    private BookingChange saveChange(Booking booking) {
        Booking saved = bookingRepository.save(booking);

        return new BookingChange(saved, mapToResponse(saved));
    }

    private void notifySafely(Runnable notification, Integer bookingId) {
        try {
            notification.run();
        } catch (Exception exception) {
            // The booking already committed. Do not report it as failed
            // merely because a notification could not be delivered.
            log.warn(
                    "Notification failed for committed booking {}",
                    bookingId
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(Integer userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
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

                booking.getUser() != null
                        ? booking.getUser().getId() : null,
                booking.getUser() != null
                        ? booking.getUser().getFullName() : null,
                booking.getUser() != null
                        ? booking.getUser().getEmail() : null,

                service != null ? service.getId() : null,
                service != null ? service.getName() : null,
                service != null ? service.getPrice() : null,
                service != null ? service.getDurationMinutes() : null,

                service != null && service.getBusiness() != null
                        ? service.getBusiness().getId() : null,
                service != null && service.getBusiness() != null
                        ? service.getBusiness().getName() : null,
                service != null && service.getBusiness() != null
                        ? service.getBusiness().getLocation() : null
        );
    }

    private record BookingChange(
            Booking booking,
            BookingResponse response
    ) {
    }
}