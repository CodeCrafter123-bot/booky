package com.hussein.booky.service;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.BusinessHours;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

class BookingAvailabilityRulesTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 12);

    private static BusinessHours openHours(LocalTime open, LocalTime close) {
        BusinessHours hours = new BusinessHours();
        hours.setOpenTime(open);
        hours.setCloseTime(close);
        hours.setClosed(false);
        return hours;
    }

    private static Booking bookingAt(LocalTime start, int durationMinutes) {
        BookyService service = new BookyService();
        service.setDurationMinutes(durationMinutes);

        Booking booking = new Booking();
        booking.setAppointmentTime(DAY.atTime(start));
        booking.setService(service);
        booking.setStatus("CONFIRMED");
        return booking;
    }

    // --- business hours ---

    @Test
    void rejectsBookingOnAClosedDay() {
        BusinessHours hours = openHours(LocalTime.of(9, 0), LocalTime.of(17, 0));
        hours.setClosed(true);

        LocalDateTime start = DAY.atTime(10, 0);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.validateBusinessHours(
                        start, start.plusMinutes(30), hours))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("closed");
    }

    @Test
    void rejectsInvertedOrMissingHours() {
        BusinessHours hours = openHours(LocalTime.of(17, 0), LocalTime.of(9, 0));
        LocalDateTime start = DAY.atTime(10, 0);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.validateBusinessHours(
                        start, start.plusMinutes(30), hours))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("invalid");
    }

    @Test
    void rejectsBookingBeforeOpeningTime() {
        BusinessHours hours = openHours(LocalTime.of(9, 0), LocalTime.of(17, 0));
        LocalDateTime start = DAY.atTime(8, 30);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.validateBusinessHours(
                        start, start.plusMinutes(30), hours))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("opening");
    }

    @Test
    void rejectsServiceEndingAfterClosingTime() {
        BusinessHours hours = openHours(LocalTime.of(9, 0), LocalTime.of(17, 0));
        LocalDateTime start = DAY.atTime(16, 45);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.validateBusinessHours(
                        start, start.plusMinutes(30), hours))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("closing");
    }

    @Test
    void allowsBookingThatExactlyFillsBusinessHours() {
        BusinessHours hours = openHours(LocalTime.of(9, 0), LocalTime.of(17, 0));
        LocalDateTime start = DAY.atTime(9, 0);
        LocalDateTime end = DAY.atTime(17, 0);

        assertThatCode(() ->
                BookingAvailabilityRules.validateBusinessHours(start, end, hours))
                .doesNotThrowAnyException();
    }

    // --- overlap detection ---

    @Test
    void noConflictWhenNoExistingBookings() {
        LocalDateTime start = DAY.atTime(10, 0);

        assertThatCode(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, start.plusMinutes(30), List.of()))
                .doesNotThrowAnyException();
    }

    @Test
    void detectsOverlapWhenNewBookingStartsDuringExisting() {
        Booking existing = bookingAt(LocalTime.of(10, 0), 60);

        LocalDateTime start = DAY.atTime(10, 30);
        LocalDateTime end = start.plusMinutes(30);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, end, List.of(existing)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    void detectsOverlapWhenNewBookingFullyContainsExisting() {
        Booking existing = bookingAt(LocalTime.of(10, 15), 15);

        LocalDateTime start = DAY.atTime(10, 0);
        LocalDateTime end = start.plusMinutes(60);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, end, List.of(existing)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void allowsBackToBackBookingsThatOnlyTouch() {
        Booking existing = bookingAt(LocalTime.of(10, 0), 60);

        // Starts exactly when the existing booking ends - not an overlap.
        LocalDateTime start = DAY.atTime(11, 0);
        LocalDateTime end = start.plusMinutes(30);

        assertThatCode(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, end, List.of(existing)))
                .doesNotThrowAnyException();
    }

    @Test
    void allowsNonOverlappingBookingEarlierInTheDay() {
        Booking existing = bookingAt(LocalTime.of(14, 0), 30);

        LocalDateTime start = DAY.atTime(9, 0);
        LocalDateTime end = start.plusMinutes(30);

        assertThatCode(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, end, List.of(existing)))
                .doesNotThrowAnyException();
    }

    @Test
    void checksEveryExistingBookingNotJustTheFirst() {
        Booking first = bookingAt(LocalTime.of(9, 0), 30);
        Booking conflicting = bookingAt(LocalTime.of(12, 0), 30);

        LocalDateTime start = DAY.atTime(12, 15);
        LocalDateTime end = start.plusMinutes(30);

        assertThat(List.of(first, conflicting)).hasSize(2);

        assertThatThrownBy(() ->
                BookingAvailabilityRules.ensureNoOverlap(
                        start, end, List.of(first, conflicting)))
                .isInstanceOf(ResponseStatusException.class);
    }
}
