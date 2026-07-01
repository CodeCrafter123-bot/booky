package com.hussein.booky.service;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    List<BookingResponse> getBookingsByUser(Integer userId);

    BookingResponse cancelBooking(Integer bookingId);
}