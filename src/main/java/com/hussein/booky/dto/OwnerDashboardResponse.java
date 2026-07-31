package com.hussein.booky.dto;

import java.util.List;
//response dto combines all the statistics and info needed to display the owner dashboard in the frontend
public class OwnerDashboardResponse {

    private long todayBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;

    private double averageRating;
    private long totalReviews;

    private long totalBusinesses;
    private long totalServices;

    private List<PopularServiceResponse> popularServices;
    private List<RecentBookingResponse> recentBookings;

    public OwnerDashboardResponse() {
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public long getTotalBusinesses() {
        return totalBusinesses;
    }

    public void setTotalBusinesses(long totalBusinesses) {
        this.totalBusinesses = totalBusinesses;
    }

    public long getTotalServices() {
        return totalServices;
    }

    public void setTotalServices(long totalServices) {
        this.totalServices = totalServices;
    }

    public List<PopularServiceResponse> getPopularServices() {
        return popularServices;
    }

    public void setPopularServices(List<PopularServiceResponse> popularServices) {
        this.popularServices = popularServices;
    }

    public List<RecentBookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<RecentBookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }
}