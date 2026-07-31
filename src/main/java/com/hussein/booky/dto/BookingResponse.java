package com.hussein.booky.dto;

import java.time.LocalDateTime;
//response dto to send the booking details back to the client
//it include some info about the booking 
/*
  Response DTO returned after retrieving, creating,
  cancelling, accepting or declining a booking. */
public class BookingResponse {

    private Integer id;
    private LocalDateTime appointmentTime;
    private String status;

    private Integer userId;
    private String clientName;
    private String clientEmail;

    private Integer serviceId;
    private String serviceName;
    private Double servicePrice;
    private Integer serviceDuration;

    private Integer businessId;
    private String businessName;
    private String businessLocation;

    public BookingResponse(
            Integer id,
            LocalDateTime appointmentTime,
            String status,
            Integer userId,
            String clientName,
            String clientEmail,
            Integer serviceId,
            String serviceName,
            Double servicePrice,
            Integer serviceDuration,
            Integer businessId,
            String businessName,
            String businessLocation
    ) {
        this.id = id;
        this.appointmentTime = appointmentTime;
        this.status = status;
        this.userId = userId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.servicePrice = servicePrice;
        this.serviceDuration = serviceDuration;
        this.businessId = businessId;
        this.businessName = businessName;
        this.businessLocation = businessLocation;
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

    public String getClientName() {
        return clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public Double getServicePrice() {
        return servicePrice;
    }

    public Integer getServiceDuration() {
        return serviceDuration;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public String getBusinessLocation() {
        return businessLocation;
    }
}