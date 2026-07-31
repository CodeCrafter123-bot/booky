package com.hussein.booky.dto;
/*is a response DTO containing summarized rating information for one business.
 

Instead of returning every review, it returns:

Business identity
Average rating
Total number of reviews
*/
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