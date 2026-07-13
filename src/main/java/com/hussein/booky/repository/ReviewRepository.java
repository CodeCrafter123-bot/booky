package com.hussein.booky.repository;

import com.hussein.booky.entity.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository
        extends JpaRepository<Review, Integer> {

    boolean existsByBookingId(Integer bookingId);

    List<Review> findByClientIdOrderByCreatedAtDesc(
            Integer clientId
    );

    List<Review> findByBusinessIdOrderByCreatedAtDesc(
            Integer businessId
    );

    @Query("""
            SELECT r
            FROM Review r
            WHERE r.business.owner.id = :ownerId
            ORDER BY r.createdAt DESC
            """)
    List<Review> findReviewsByOwnerId(
            @Param("ownerId") Integer ownerId
    );

    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT AVG(r.rating)
            FROM Review r
            WHERE r.business.id = :businessId
            """)
    Double findAverageRatingByBusinessId(
            @Param("businessId") Integer businessId
    );

    long countByBusinessId(Integer businessId);
    @Query("""
        SELECT COUNT(r)
        FROM Review r
        WHERE r.business.owner.id = :ownerId
        """)
long countReviewsByOwnerId(
        @Param("ownerId") Integer ownerId
);

@Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.business.owner.id = :ownerId
        """)
Double findAverageRatingByOwnerId(
        @Param("ownerId") Integer ownerId
);
}