package com.hussein.booky.dto;

public class ReviewSummaryResponse {

    private Integer businessId;
    private String businessName;
    private Double averageRating;
    private Long totalReviews;

    public ReviewSummaryResponse(
            Integer businessId,
            String businessName,
            Double averageRating,
            Long totalReviews
    ) {
        this.businessId = businessId;
        this.businessName = businessName;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }
}