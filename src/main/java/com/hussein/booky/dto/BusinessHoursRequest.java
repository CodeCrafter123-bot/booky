package com.hussein.booky.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
//request dto to recieve the business hours info from the frontend to the backend for one business 
public class BusinessHoursRequest {

  private Integer businessId;
    private DayOfWeek dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean closed;

    public Integer getBusinessId() {
        return businessId;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getOpenTime() {
        return openTime;
    }

    public LocalTime getCloseTime() {
        return closeTime;
    }

    public boolean isClosed() {
        return closed;
    }
public void setBusinessId(Integer businessId) {
        this.businessId = businessId;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }

    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }

    public void setClosed(boolean closed) {
        this.closed = closed;
    }
}