package com.hussein.booky.dto;

import java.time.LocalDateTime;

public class BookingResponse {

    private Integer id;
    private LocalDateTime appointmentTime;
    private String status;
    private Integer userId;
    private Integer serviceId;
    private String serviceName;

    public BookingResponse(Integer id, LocalDateTime appointmentTime, String status,
                           Integer userId, Integer serviceId, String serviceName) {
        this.id = id;
        this.appointmentTime = appointmentTime;
        this.status = status;
        this.userId = userId;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
    }

    public Integer getId() {
        return id;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public String getStatus() {
        return status;
    }

    public Integer getUserId() {
        return userId;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }
}