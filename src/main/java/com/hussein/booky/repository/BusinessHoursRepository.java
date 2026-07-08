package com.hussein.booky.repository;

import com.hussein.booky.entity.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {

    List<BusinessHours> findByBusinessId(Integer businessId);

    Optional<BusinessHours> findByBusinessIdAndDayOfWeek(Integer businessId, DayOfWeek dayOfWeek);

}