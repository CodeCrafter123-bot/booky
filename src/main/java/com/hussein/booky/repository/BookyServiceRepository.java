package com.hussein.booky.repository;

import com.hussein.booky.entity.BookyService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookyServiceRepository extends JpaRepository<BookyService, Integer> {

    List<BookyService> findByBusinessId(Integer businessId);

    long countByBusinessOwnerId(Integer ownerId);
}