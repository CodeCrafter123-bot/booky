package com.hussein.booky.controller;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final JwtService jwtService;

    public BookingController(BookingService bookingService, JwtService jwtService) {
        this.bookingService = bookingService;
        this.jwtService = jwtService;
    }

    @PostMapping("/create")
public ResponseEntity<BookingResponse> createBooking(
        @Valid @RequestBody BookingRequest request,
        @RequestHeader("Authorization") String authHeader
) {
    String token = authHeader.substring(7);

    System.out.println("TOKEN = " + token);

    Integer userId = jwtService.extractUserId(token);

    System.out.println("USER ID = " + userId);

    return ResponseEntity.ok(bookingService.createBooking(request, userId));
}
@GetMapping("/my")
public ResponseEntity<List<BookingResponse>> getMyBookings(
        @RequestHeader("Authorization") String authHeader
) {
    String token = authHeader.substring(7);
    Integer userId = jwtService.extractUserId(token);

    return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
}
    @PutMapping("/cancel/{bookingId}")
public ResponseEntity<BookingResponse> cancelBooking(
        @PathVariable Integer bookingId,
        @RequestHeader("Authorization") String authHeader
) {
    String token = authHeader.substring(7);
    Integer userId = jwtService.extractUserId(token);

    return ResponseEntity.ok(bookingService.cancelBooking(bookingId, userId));
}
@GetMapping("/admin")
public ResponseEntity<List<BookingResponse>> getAllBookings() {
    return ResponseEntity.ok(bookingService.getAllBookings());
}

@PutMapping("/accept/{bookingId}")
public ResponseEntity<BookingResponse> acceptBooking(
        @PathVariable Integer bookingId
) {
    return ResponseEntity.ok(bookingService.acceptBooking(bookingId));
}

@PutMapping("/decline/{bookingId}")
public ResponseEntity<BookingResponse> declineBooking(
        @PathVariable Integer bookingId
) {
    return ResponseEntity.ok(bookingService.declineBooking(bookingId));
}
}