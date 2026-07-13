package com.hussein.booky.dto;

public class PopularServiceResponse {

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