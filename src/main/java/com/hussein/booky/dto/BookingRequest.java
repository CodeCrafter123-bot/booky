package com.hussein.booky.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class BookingRequest {

    @NotNull(message = "Appointment time is required")
    @Future(message = "Appointment time must be in the future")
    private LocalDateTime appointmentTime;

    @NotNull(message = "Service ID is required")
    private Integer serviceId;

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public Integer getServiceId() {
        return serviceId;
    }
}