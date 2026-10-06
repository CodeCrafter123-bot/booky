package com.hussein.booky.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class BookyTimeTest {

    private static final ZoneId BEIRUT = ZoneId.of("Asia/Beirut");

    @Test
    void futureAppointmentIsFuture() {
        LocalDateTime future = ZonedDateTime.now(BEIRUT)
                .plusDays(1)
                .toLocalDateTime();

        assertThat(BookyTime.isFuture(future)).isTrue();
        assertThat(BookyTime.hasPassed(future)).isFalse();
    }

    @Test
    void pastAppointmentHasPassed() {
        LocalDateTime past = ZonedDateTime.now(BEIRUT)
                .minusDays(1)
                .toLocalDateTime();

        assertThat(BookyTime.isFuture(past)).isFalse();
        assertThat(BookyTime.hasPassed(past)).isTrue();
    }

    @Test
    void nullAppointmentIsNeitherFutureNorPassed() {
        assertThat(BookyTime.isFuture(null)).isFalse();
        assertThat(BookyTime.hasPassed(null)).isFalse();
    }
}
