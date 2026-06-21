package com.hussein.booky.controller;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Integer userId) {
        return bookingRepository.findByUserId(userId);
    }
}