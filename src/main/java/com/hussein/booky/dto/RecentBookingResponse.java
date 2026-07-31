package com.hussein.booky.dto;

import java.time.LocalDateTime;

public class RecentBookingResponse {
/*
is a response DTO representing one recent booking displayed on the owner dashboard */
    private Integer bookingId;
    private String clientName;
    private String clientEmail;
    private String businessName;
    private String serviceName;
    private LocalDateTime appointmentTime;
    private String status;

    public RecentBookingResponse() {
    }

    public RecentBookingResponse(
            Integer bookingId,
            String clientName,
            String clientEmail,
            String businessName,
            String serviceName,
            LocalDateTime appointmentTime,
            String status
    ) {
        this.bookingId = bookingId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.businessName = businessName;
        this.serviceName = serviceName;
        this.appointmentTime = appointmentTime;
        this.status = status;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}