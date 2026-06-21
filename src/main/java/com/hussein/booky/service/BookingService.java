package com.hussein.booky.service;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookyServiceRepository bookyServiceRepository;

    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        BookyService service = bookyServiceRepository.findById(request.getServiceId()).orElse(null);

        if (user == null || service == null) {
            return null;
        }

        Booking booking = new Booking();
        booking.setAppointmentTime(request.getAppointmentTime());
        booking.setUser(user);
        booking.setService(service);
        booking.setStatus("PENDING");

        Booking savedBooking = bookingRepository.save(booking);

        return new BookingResponse(
                savedBooking.getId(),
                savedBooking.getAppointmentTime(),
                savedBooking.getStatus(),
                savedBooking.getUser().getId(),
                savedBooking.getService().getId(),
                savedBooking.getService().getName()
        );
    }
}