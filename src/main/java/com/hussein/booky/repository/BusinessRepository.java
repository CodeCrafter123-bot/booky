package com.hussein.booky.repository;

import com.hussein.booky.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessRepository extends JpaRepository<Business, Integer> {

    List<Business> findByOwnerId(Integer ownerId);

    long countByOwnerId(Integer ownerId);
}