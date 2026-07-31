package com.hussein.booky.dto;
//small response dto that contains the most popular services in the system and their booking count
public class PopularServiceResponse {
//contains the service name and the number of bookings for that service in the system
    private String serviceName;
    private long bookingCount;

    public PopularServiceResponse() {
    }

    public PopularServiceResponse(String serviceName, long bookingCount) {
        this.serviceName = serviceName;
        this.bookingCount = bookingCount;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }
}