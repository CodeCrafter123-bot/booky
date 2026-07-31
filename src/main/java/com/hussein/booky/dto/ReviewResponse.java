package com.hussein.booky.dto;

import java.time.LocalDateTime;
/*
is a response DTO that combines review information with related booking, client, business, and service information. */
public class ReviewResponse {

    private Integer id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    private Integer bookingId;

    private Integer clientId;
    private String clientName;
    private String clientEmail;

    private Integer businessId;
    private String businessName;

    private String serviceName;
    private LocalDateTime appointmentTime;

    public ReviewResponse(
            Integer id,
            Integer rating,
            String comment,
            LocalDateTime createdAt,
            Integer bookingId,
            Integer clientId,
            String clientName,
            String clientEmail,
            Integer businessId,
            String businessName,
            String serviceName,
            LocalDateTime appointmentTime
    ) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.bookingId = bookingId;
        this.clientId = clientId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.businessId = businessId;
        this.businessName = businessName;
        this.serviceName = serviceName;
        this.appointmentTime = appointmentTime;
    }

    public Integer getId() {
        return id;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public Integer getClientId() {
        return clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public String getServiceName() {
        return serviceName;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }
}