package com.hussein.booky.service.impl;

import com.hussein.booky.dto.OwnerDashboardResponse;
import com.hussein.booky.dto.PopularServiceResponse;
import com.hussein.booky.dto.RecentBookingResponse;
import com.hussein.booky.entity.Booking;
import com.hussein.booky.repository.BookingRepository;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessRepository;
import com.hussein.booky.repository.ReviewRepository;
import com.hussein.booky.service.OwnerDashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OwnerDashboardServiceImpl implements OwnerDashboardService {

    private final BookingRepository bookingRepository;
    private final BusinessRepository businessRepository;
    private final BookyServiceRepository bookyServiceRepository;
    private final ReviewRepository reviewRepository;

    public OwnerDashboardServiceImpl(
            BookingRepository bookingRepository,
            BusinessRepository businessRepository,
            BookyServiceRepository bookyServiceRepository,
            ReviewRepository reviewRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.businessRepository = businessRepository;
        this.bookyServiceRepository = bookyServiceRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public OwnerDashboardResponse getDashboard(Integer ownerId) {

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        OwnerDashboardResponse response = new OwnerDashboardResponse();

        // Today's bookings
        response.setTodayBookings(
                bookingRepository.countTodayBookings(
                        ownerId,
                        startOfDay,
                        endOfDay
                )
        );

        // Booking status totals
        response.setPendingBookings(
                bookingRepository.countByOwnerAndStatus(
                        ownerId,
                        "PENDING"
                )
        );

        response.setConfirmedBookings(
                bookingRepository.countByOwnerAndStatus(
                        ownerId,
                        "CONFIRMED"
                )
        );

        response.setCancelledBookings(
                bookingRepository.countByOwnerAndStatus(
                        ownerId,
                        "CANCELLED"
                )
        );

        // Business and service totals
        response.setTotalBusinesses(
                businessRepository.countByOwnerId(ownerId)
        );

        response.setTotalServices(
                bookyServiceRepository.countByBusinessOwnerId(ownerId)
        );

        // Review statistics
        long totalReviews =
                reviewRepository.countReviewsByOwnerId(ownerId);

        Double averageRating =
                reviewRepository.findAverageRatingByOwnerId(ownerId);

        response.setTotalReviews(totalReviews);

        response.setAverageRating(
                averageRating == null
                        ? 0.0
                        : Math.round(averageRating * 10.0) / 10.0
        );

        // Popular services and recent bookings
        response.setPopularServices(
                getPopularServices(ownerId)
        );

        response.setRecentBookings(
                getRecentBookings(ownerId)
        );

        return response;
    }

    private List<PopularServiceResponse> getPopularServices(
            Integer ownerId
    ) {

        return bookingRepository
                .findPopularServicesByOwnerId(ownerId)
                .stream()
                .limit(5)
                .map(row -> new PopularServiceResponse(
                        (String) row[0],
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    private List<RecentBookingResponse> getRecentBookings(
            Integer ownerId
    ) {

        return bookingRepository
                .findRecentBookingsByOwnerId(ownerId)
                .stream()
                .limit(5)
                .map(this::mapRecentBooking)
                .toList();
    }

    private RecentBookingResponse mapRecentBooking(
            Booking booking
    ) {

       return new RecentBookingResponse(
        booking.getId(),
        booking.getUser().getFullName(),
        booking.getUser().getEmail(),
        booking.getService().getBusiness().getName(),
        booking.getService().getName(),
        booking.getAppointmentTime(),
        booking.getStatus()
);
    }
}