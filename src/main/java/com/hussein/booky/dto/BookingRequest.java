package com.hussein.booky.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class BookingRequest {

    // Interpreted as Lebanon local time.
    // Future-time validation is performed in BookingServiceImpl.
    @NotNull(message = "Appointment time is required")
    private LocalDateTime appointmentTime;

    @NotNull(message = "Service ID is required")
    @Positive(message = "Service ID must be positive")
    private Integer serviceId;

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public Integer getServiceId() {
        return serviceId;
    }
}