package com.hussein.booky.util;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

public final class BookyTime {

    private static final ZoneId ZONE = ZoneId.of("Asia/Beirut");
    private static final Clock CLOCK = Clock.system(ZONE);

    private BookyTime() {
    }

    public static LocalDate today() {
        return LocalDate.now(CLOCK);
    }

    public static boolean isFuture(LocalDateTime appointment) {
        if (appointment == null) {
            return false;
        }

        List<ZoneOffset> offsets =
                ZONE.getRules().getValidOffsets(appointment);

        // Reject nonexistent or ambiguous clock-change times.
        // The current API has no offset field to distinguish them.
        if (offsets.size() != 1) {
            return false;
        }

        return appointment.toInstant(offsets.get(0))
                .isAfter(CLOCK.instant());
    }
public static boolean hasPassed(LocalDateTime appointment) {
    if (appointment == null) {
        return false;
    }

    List<ZoneOffset> offsets =
            ZONE.getRules().getValidOffsets(appointment);

    if (offsets.size() != 1) {
        return false;
    }

    return !appointment.toInstant(offsets.get(0))
            .isAfter(CLOCK.instant());
}
}