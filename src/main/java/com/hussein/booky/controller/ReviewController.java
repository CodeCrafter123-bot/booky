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

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");

        if (!"CLIENT".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only clients can submit reviews"
                    ));
        }

        ReviewResponse review =
                reviewService.createReview(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(review);
    }

    @GetMapping("/business/{businessId}")
    public List<ReviewResponse> getBusinessReviews(
            @PathVariable Integer businessId
    ) {
        return reviewService.getReviewsByBusiness(businessId);
    }

    @GetMapping("/business/{businessId}/summary")
    public ReviewSummaryResponse getBusinessSummary(
            @PathVariable Integer businessId
    ) {
        return reviewService.getBusinessSummary(businessId);
    }

    @GetMapping("/client")
    public ResponseEntity<?> getClientReviews(
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");

        if (!"CLIENT".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Clients only"
                    ));
        }

        return ResponseEntity.ok(
                reviewService.getClientReviews(userId)
        );
    }

    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerReviews(
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");

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

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminReviews(
            HttpServletRequest httpRequest
    ) {
        String role =
                (String) httpRequest.getAttribute("role");

        if (!"ADMIN".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Admins only"
                    ));
        }

        return ResponseEntity.ok(
                reviewService.getAllReviewsForAdmin()
        );
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer reviewId,
            HttpServletRequest httpRequest
    ) {
        String role =
                (String) httpRequest.getAttribute("role");

        if (!"ADMIN".equals(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Admins only"
                    ));
        }

        reviewService.deleteReviewForAdmin(reviewId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Review deleted successfully"
                )
        );
    }
}