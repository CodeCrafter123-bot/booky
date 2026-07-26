package com.hussein.booky.controller;

import com.hussein.booky.dto.CreateReviewRequest;
import com.hussein.booky.dto.ReviewResponse;
import com.hussein.booky.dto.ReviewSummaryResponse;
import com.hussein.booky.service.ReviewService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
//this manages all review operations for clients owners and admin and public pages 
@RestController
@RequestMapping("/reviews")
public class ReviewController {
//main review logic 
/*
create review 
retreive review 
calculate review summary 
delete review  */
    private final ReviewService reviewService;
//constructor 
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }
/*
     * CLIENT: Create a new review.
     *
     * Endpoint:
     * POST /reviews/create
     *
     * Required header:
     * Authorization: Bearer <JWT>
     *
     * Example request body:
     *
     * {
     *   "bookingId": 18,
     *   "rating": 5,
     *   "comment": "Excellent service"
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<?> createReview(
        //validation checks 
            @Valid @RequestBody CreateReviewRequest request,
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");
//only user with clients roles can submit a review 
        if (!"CLIENT".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only clients can submit reviews"
                    ));
        }
//service should verify that 
/*
booking exist 
booking belong to client 
booking is confirmed 
appointment is in the past 
booking has been already reviewed  */
        ReviewResponse review =
                reviewService.createReview(userId, request);
//return http status and code 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(review);
    }
//retrieve all review for oen business 
    @GetMapping("/business/{businessId}")
    public List<ReviewResponse> getBusinessReviews(
            @PathVariable Integer businessId
    ) {
        return reviewService.getReviewsByBusiness(businessId);
    }
//retrieve a review summary for one business 
    @GetMapping("/business/{businessId}/summary")
    public ReviewSummaryResponse getBusinessSummary(
            @PathVariable Integer businessId
    ) {
        return reviewService.getBusinessSummary(businessId);
    }
//client : retrieve review submitted by the logged in client 
    @GetMapping("/client")
    public ResponseEntity<?> getClientReviews(
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");
//read the logged in user role 
        String role =
                (String) httpRequest.getAttribute("role");
//only client can use this endpoint 
        if (!"CLIENT".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Clients only"
                    ));
        }
// return only reviews created by this client 
        return ResponseEntity.ok(
                reviewService.getClientReviews(userId)
        );
    }
//retreive reviews for businesses owned by the logged in owner 
    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerReviews(
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");
//only owner can use this endpoint 
        if (!"OWNER".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Owners only"
                    ));
        }

        return ResponseEntity.ok(
                reviewService.getOwnerReviews(userId)
        );
    }
// ADMIN: Retrieve every review in Booky.
    @GetMapping("/admin")
    public ResponseEntity<?> getAdminReviews(
            HttpServletRequest httpRequest
    ) {
        String role =
                (String) httpRequest.getAttribute("role");
//only admin can view all reviews 
        if (!"ADMIN".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Admins only"
                    ));
        }
//returns all reviews 
        return ResponseEntity.ok(
                reviewService.getAllReviewsForAdmin()
        );
    }
//delete a review 
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer reviewId,
            HttpServletRequest httpRequest
    ) {
        String role =
                (String) httpRequest.getAttribute("role");
//only admin can delete 
        if (!"ADMIN".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Admins only"
                    ));
        }

        reviewService.deleteReviewForAdmin(reviewId);
//return success message 
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Review deleted successfully"
                )
        );
    }
}