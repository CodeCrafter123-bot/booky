package com.hussein.booky.service;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BusinessHours;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

// Pure rules (no DB, no transaction) for whether a candidate booking slot
// fits inside a business's hours and does not collide with an existing
// booking. Kept out of BookingServiceImpl so the logic most responsible
// for double-booking bugs can be unit tested without a database.
public final class BookingAvailabilityRules {

    private BookingAvailabilityRules() {
    }

    public static void validateBusinessHours(
            LocalDateTime start,
            LocalDateTime end,
            BusinessHours hours
    ) {
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
    }

    public static void ensureNoOverlap(
            LocalDateTime start,
            LocalDateTime end,
            List<Booking> activeBookings
    ) {
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
}
