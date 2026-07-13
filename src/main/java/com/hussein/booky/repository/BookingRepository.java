package com.hussein.booky.repository;

import com.hussein.booky.entity.Booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Integer> {

    List<Booking> findByUserId(Integer userId);

    List<Booking> findByStatus(String status);

    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.service.business.owner.id = :ownerId
            """)
    List<Booking> findBookingsByOwnerId(
            @Param("ownerId") Integer ownerId
    );

    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.service.business.id = :businessId
            AND b.status IN ('PENDING', 'CONFIRMED')
            """)
    List<Booking> findActiveBookingsByBusinessId(
            @Param("businessId") Integer businessId
    );

    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.service.business.id = :businessId
            AND DATE(b.appointmentTime) = :date
            AND b.status IN ('PENDING', 'CONFIRMED')
            """)
    List<Booking> findBookingsForDate(
            @Param("businessId") Integer businessId,
            @Param("date") LocalDate date
    );

    /*
     * Count today's bookings for businesses owned by the owner.
     */
    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.service.business.owner.id = :ownerId
            AND b.appointmentTime >= :startOfDay
            AND b.appointmentTime < :endOfDay
            """)
    long countTodayBookings(
            @Param("ownerId") Integer ownerId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /*
     * Count bookings by status for businesses owned by the owner.
     */
    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.service.business.owner.id = :ownerId
            AND b.status = :status
            """)
    long countByOwnerAndStatus(
            @Param("ownerId") Integer ownerId,
            @Param("status") String status
    );

    /*
     * Get owner bookings ordered from newest appointment to oldest.
     */
    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.service.business.owner.id = :ownerId
            ORDER BY b.appointmentTime DESC
            """)
    List<Booking> findRecentBookingsByOwnerId(
            @Param("ownerId") Integer ownerId
    );

    /*
     * Get the most booked services.
     * Cancelled bookings are excluded.
     */
    @Query("""
            SELECT b.service.name, COUNT(b)
            FROM Booking b
            WHERE b.service.business.owner.id = :ownerId
            AND b.status <> 'CANCELLED'
            GROUP BY b.service.id, b.service.name
            ORDER BY COUNT(b) DESC
            """)
    List<Object[]> findPopularServicesByOwnerId(
            @Param("ownerId") Integer ownerId
    );
}