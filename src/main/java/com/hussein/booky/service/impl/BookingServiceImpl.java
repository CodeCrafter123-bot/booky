package com.hussein.booky.service.impl;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.service.BookingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookyServiceRepository bookyServiceRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              UserRepository userRepository,
                              BookyServiceRepository bookyServiceRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.bookyServiceRepository = bookyServiceRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BookyService service = bookyServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Booking booking = new Booking();
        booking.setAppointmentTime(request.getAppointmentTime());
        booking.setStatus("PENDING");
        booking.setUser(user);
        booking.setService(service);

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
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
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
        throw new RuntimeException("You are not allowed to cancel this booking");
    }

    booking.setStatus("CANCELLED");

    Booking updatedBooking = bookingRepository.save(booking);

    return mapToResponse(updatedBooking);
}

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getAppointmentTime(),
                booking.getStatus(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getService() != null ? booking.getService().getId() : null,
                booking.getService() != null ? booking.getService().getName() : null
        );
    }

    @Override
    public List<BookingResponse> getBookingsByOwner(Integer ownerId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getBookingsByOwner'");
    }
}