package com.hussein.booky.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record BusinessHoursResponse(
        Long id,
        Integer businessId,
        DayOfWeek dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed
) {
}