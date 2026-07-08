package com.hussein.booky.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
public class BusinessHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Business business;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private LocalTime openTime;
    private LocalTime closeTime;

    private boolean closed;

    public BusinessHours() {
    }

    public BusinessHours(Business business, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed) {
        this.business = business;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.closed = closed;
    }

    public Long getId() {
        return id;
    }

    public Business getBusiness() {
        return business;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setBusiness(Business business) {
        this.business = business;
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