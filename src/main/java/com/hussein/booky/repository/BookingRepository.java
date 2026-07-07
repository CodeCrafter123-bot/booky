package com.hussein.booky.repository;

import com.hussein.booky.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByUserId(Integer userId);

    List<Booking> findByStatus(String status);

    @Query("""
           SELECT b FROM Booking b
           WHERE b.service.business.owner.id = :ownerId
           """)
    List<Booking> findBookingsByOwnerId(@Param("ownerId") Integer ownerId);
}