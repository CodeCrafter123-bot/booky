package com.hussein.booky.controller;

import com.hussein.booky.dto.BookingRequest;
import com.hussein.booky.dto.BookingResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//using rest 
@RestController
//every endpoint start with bookings
@RequestMapping("/bookings")
public class BookingController {
//booking logic such as create find cancel and accept and decline 
    private final BookingService bookingService;
    //created validates and extracts info from jwt 
    private final JwtService jwtService;

    public BookingController(BookingService bookingService, JwtService jwtService) {
        this.bookingService = bookingService;
        this.jwtService = jwtService;
    }
//client create new booking end point is post and the required header is bearer and jwt 
    @PostMapping("/create")
public ResponseEntity<BookingResponse> createBooking(
    //activates validation and reads auth header form http request 
        @Valid @RequestBody BookingRequest request,
        @RequestHeader("Authorization") String authHeader
) { //removing 1st 7 charcater which is "bearer "
    String token = authHeader.substring(7);

    System.out.println("TOKEN = " + token);
//read user id from the jwt 
    Integer userId = jwtService.extractUserId(token);

    System.out.println("USER ID = " + userId);
//returns http status code 200 ok 
    return ResponseEntity.ok(bookingService.createBooking(request, userId));
}

//client retrive all booking to the logged in client 
@GetMapping("/my")
public ResponseEntity<List<BookingResponse>> getMyBookings(
    //required header: authorization 
        @RequestHeader("Authorization") String authHeader
) {
    //remove vearer and extarct the logged in user id 
    String token = authHeader.substring(7);
    Integer userId = jwtService.extractUserId(token);
//return type is list because can have multiple bookings 
    return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
}
//cancel booking 
    @PutMapping("/cancel/{bookingId}")
    //reading booking id and jwt from url 
public ResponseEntity<BookingResponse> cancelBooking(
        @PathVariable Integer bookingId,
        @RequestHeader("Authorization") String authHeader
) {
    //remove bearer and identifies user requesting 
    String token = authHeader.substring(7);
    Integer userId = jwtService.extractUserId(token);
//both booking id and user id are passed to service to prevent client from cancelling another client booking 
    return ResponseEntity.ok(bookingService.cancelBooking(bookingId, userId));
}
//retrieve all booking 
@GetMapping("/admin")
//returns every booking in the system 
public ResponseEntity<List<BookingResponse>> getAllBookings() {
    return ResponseEntity.ok(bookingService.getAllBookings());
}
//accept a pending booking (for admin)
@PutMapping("/accept/{bookingId}")
///read id from url 
public ResponseEntity<BookingResponse> acceptBooking(
        @PathVariable Integer bookingId
) {
    return ResponseEntity.ok(bookingService.acceptBooking(bookingId));
}
//decline pending booking same as accept algorithm 
@PutMapping("/decline/{bookingId}")
public ResponseEntity<BookingResponse> declineBooking(
        @PathVariable Integer bookingId
) {
    return ResponseEntity.ok(bookingService.declineBooking(bookingId));
}
//retreive booking made for busimess belonging to the logged in owner 
@GetMapping("/owner")
public ResponseEntity<List<BookingResponse>> getOwnerBookings(
        @RequestHeader("Authorization") String authHeader
) {
    String token = authHeader.substring(7);
    Integer ownerId = jwtService.extractUserId(token);
//business owned by the user id 
    return ResponseEntity.ok(bookingService.getBookingsByOwner(ownerId));
}
}