package com.hussein.booky.repository;

import com.hussein.booky.entity.Business;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BusinessRepository
        extends JpaRepository<Business, Integer> {

    List<Business> findByOwnerId(Integer ownerId);

    long countByOwnerId(Integer ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Business b WHERE b.id = :businessId")
    Optional<Business> findByIdForUpdate(
            @Param("businessId") Integer businessId
    );
}