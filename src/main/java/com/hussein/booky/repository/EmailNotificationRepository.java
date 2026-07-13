package com.hussein.booky.repository;

import com.hussein.booky.entity.EmailNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailNotificationRepository
        extends JpaRepository<EmailNotification, Integer> {

    List<EmailNotification> findAllByOrderByCreatedAtDesc();

    List<EmailNotification> findByStatusOrderByCreatedAtDesc(
            String status
    );

    List<EmailNotification> findByBookingIdOrderByCreatedAtDesc(
            Integer bookingId
    );

    boolean existsByBookingIdAndNotificationTypeAndRecipientAndStatus(
            Integer bookingId,
            String notificationType,
            String recipient,
            String status
    );
}