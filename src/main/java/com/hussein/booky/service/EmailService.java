package com.hussein.booky.service;

import com.hussein.booky.entity.Booking;

public interface EmailService {

    void sendNewBookingToAdmins(Booking booking);

    void sendApprovedBookingToOwner(Booking booking);

    void sendDeclinedBookingToOwner(Booking booking);
}