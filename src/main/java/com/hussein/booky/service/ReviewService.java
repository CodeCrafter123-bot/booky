package com.hussein.booky.service;

import com.hussein.booky.dto.CreateReviewRequest;
import com.hussein.booky.dto.ReviewResponse;
import com.hussein.booky.dto.ReviewSummaryResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.Business;
import com.hussein.booky.entity.Review;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BusinessRepository;
import com.hussein.booky.repository.ReviewRepository;
import com.hussein.booky.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            BusinessRepository businessRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
    }

    /*
     * CLIENT creates a review for one of their completed bookings.
     */
    @Transactional
    public ReviewResponse createReview(
            Integer clientId,
            CreateReviewRequest request
    ) {
        if (clientId == null) {
            throw new RuntimeException("Authenticated client ID is missing");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() ->
                        new RuntimeException("Client not found")
                );

        if (!"CLIENT".equals(client.getRole())) {
            throw new RuntimeException(
                    "Only clients can submit reviews"
            );
        }

        if (request.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required");
        }

        if (request.getRating() == null) {
            throw new RuntimeException("Rating is required");
        }

        if (request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        Booking booking = bookingRepository
                .findById(request.getBookingId())
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        if (booking.getUser() == null) {
            throw new RuntimeException(
                    "Booking client information is missing"
            );
        }

        if (!booking.getUser().getId().equals(clientId)) {
            throw new RuntimeException(
                    "You can only review your own bookings"
            );
        }

        if (booking.getStatus() == null ||
                !"CONFIRMED".equalsIgnoreCase(
                        booking.getStatus()
                )) {

            throw new RuntimeException(
                    "Only confirmed bookings can be reviewed"
            );
        }

        if (booking.getAppointmentTime() == null) {
            throw new RuntimeException(
                    "Booking appointment time is missing"
            );
        }

        if (booking.getAppointmentTime()
                .isAfter(LocalDateTime.now())) {

            throw new RuntimeException(
                    "You can only review an appointment after it has passed"
            );
        }

        if (reviewRepository.existsByBookingId(
                booking.getId()
        )) {
            throw new RuntimeException(
                    "This booking has already been reviewed"
            );
        }

        if (booking.getService() == null) {
    throw new RuntimeException(
            "Booking service information is missing"
    );
}

if (booking.getService().getBusiness() == null) {
    throw new RuntimeException(
            "Booking business information is missing"
    );
}

        String comment = cleanComment(
                request.getComment()
        );

        Review review = new Review(
        request.getRating(),
        comment,
        booking,
        client,
        booking.getService().getBusiness()
);
        Review savedReview =
                reviewRepository.save(review);

        return toReviewResponse(savedReview);
    }

    /*
     * Any authenticated user can view reviews for a business.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBusiness(
            Integer businessId
    ) {
        businessRepository.findById(businessId)
                .orElseThrow(() ->
                        new RuntimeException("Business not found")
                );

        return reviewRepository
                .findByBusinessIdOrderByCreatedAtDesc(
                        businessId
                )
                .stream()
                .map(this::toReviewResponse)
                .toList();
    }

    /*
     * Returns average rating and total number of reviews.
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getBusinessSummary(
            Integer businessId
    ) {
        Business business = businessRepository
                .findById(businessId)
                .orElseThrow(() ->
                        new RuntimeException("Business not found")
                );

        Double averageRating =
                reviewRepository
                        .findAverageRatingByBusinessId(
                                businessId
                        );

        long totalReviews =
                reviewRepository.countByBusinessId(
                        businessId
                );

        if (averageRating == null) {
            averageRating = 0.0;
        }

        double roundedAverage =
                Math.round(averageRating * 10.0) / 10.0;

        return new ReviewSummaryResponse(
                business.getId(),
                business.getName(),
                roundedAverage,
                totalReviews
        );
    }

    /*
     * CLIENT views reviews they submitted.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getClientReviews(
            Integer clientId
    ) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() ->
                        new RuntimeException("Client not found")
                );

        if (!"CLIENT".equals(client.getRole())) {
            throw new RuntimeException(
                    "Only clients can view client reviews"
            );
        }

        return reviewRepository
                .findByClientIdOrderByCreatedAtDesc(
                        clientId
                )
                .stream()
                .map(this::toReviewResponse)
                .toList();
    }

    /*
     * OWNER sees only reviews for businesses they own.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getOwnerReviews(
            Integer ownerId
    ) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() ->
                        new RuntimeException("Owner not found")
                );

        if (!"OWNER".equals(owner.getRole())) {
            throw new RuntimeException(
                    "Only owners can view owner reviews"
            );
        }

        return reviewRepository
                .findReviewsByOwnerId(ownerId)
                .stream()
                .map(this::toReviewResponse)
                .toList();
    }

    /*
     * ADMIN sees all reviews.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviewsForAdmin() {
        return reviewRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toReviewResponse)
                .toList();
    }

    /*
     * ADMIN deletes an inappropriate review.
     */
    @Transactional
    public void deleteReviewForAdmin(
            Integer reviewId
    ) {
        Review review = reviewRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new RuntimeException("Review not found")
                );

        reviewRepository.delete(review);
    }

    private String cleanComment(String comment) {
        if (comment == null) {
            return null;
        }

        String cleanedComment = comment.trim();

        if (cleanedComment.isEmpty()) {
            return null;
        }

        if (cleanedComment.length() > 1000) {
            throw new RuntimeException(
                    "Review comment cannot exceed 1000 characters"
            );
        }

        return cleanedComment;
    }

    private ReviewResponse toReviewResponse(
            Review review
    ) {
        if (review == null) {
            throw new RuntimeException(
                    "Review information is missing"
            );
        }

        Booking booking = review.getBooking();
        User client = review.getClient();
        Business business = review.getBusiness();

        if (booking == null) {
            throw new RuntimeException(
                    "Review booking information is missing"
            );
        }

        if (client == null) {
            throw new RuntimeException(
                    "Review client information is missing"
            );
        }

        if (business == null) {
            throw new RuntimeException(
                    "Review business information is missing"
            );
        }

        String serviceName = "-";

        if (booking.getService() != null &&
                booking.getService().getName() != null) {

            serviceName =
                    booking.getService().getName();
        }

        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                booking.getId(),
                client.getId(),
                client.getFullName(),
                client.getEmail(),
                business.getId(),
                business.getName(),
                serviceName,
                booking.getAppointmentTime()
        );
    }
}