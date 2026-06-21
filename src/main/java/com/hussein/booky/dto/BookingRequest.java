package com.hussein.booky.dto;

import java.time.LocalDateTime;

public class BookingRequest {

    private LocalDateTime appointmentTime;
    private Integer userId;
    private Integer serviceId;

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public Integer getUserId() {
        return userId;
    }

    public Integer getServiceId() {
        return serviceId;
    }
}