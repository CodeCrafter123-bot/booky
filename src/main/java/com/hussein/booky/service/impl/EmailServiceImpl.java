package com.hussein.booky.service.impl;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.EmailNotification;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.EmailNotificationRepository;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailServiceImpl.class);

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd MMMM yyyy 'at' hh:mm a",
                    Locale.ENGLISH
            );

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final EmailNotificationRepository emailNotificationRepository;

    @Value("${spring.mail.username:disabled@booky.local}")
    private String senderEmail;

    @Value("${booky.email.enabled:false}")
    private boolean emailEnabled;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            UserRepository userRepository,
            EmailNotificationRepository emailNotificationRepository
    ) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
        this.emailNotificationRepository = emailNotificationRepository;
    }

    @Override
    public void sendNewBookingToAdmins(Booking booking) {
        if (!emailEnabled) {
            return;
        }

        try {
            if (!hasRequiredBookingDetails(booking)) {
                return;
            }

            List<User> admins = userRepository.findByRole("ADMIN");

            if (admins.isEmpty()) {
                log.warn(
                        "No admin accounts found for booking {} notification.",
                        booking.getId()
                );
                return;
            }

            for (User admin : admins) {
                if (admin.isFrozen() || !hasEmail(admin)) {
                    continue;
                }

                String subject = "New Booking Requires Approval - Booky";

                String body = """
                        Hello %s,

                        A new booking has been created and is waiting for approval.

                        Booking ID: %s

                        Client: %s
                        Client Email: %s

                        Business: %s
                        Service: %s

                        Appointment: %s
                        Price: $%.2f
                        Status: %s

                        Please open the Booky Admin Dashboard to review the booking.

                        Booky Notifications
                        """.formatted(
                        safeValue(admin.getFullName(), "Admin"),
                        booking.getId(),
                        getClientName(booking),
                        getClientEmail(booking),
                        getBusinessName(booking),
                        getServiceName(booking),
                        formatAppointment(booking),
                        getServicePrice(booking),
                        safeValue(booking.getStatus(), "PENDING")
                );

                sendEmailSafely(
                        admin.getEmail(),
                        subject,
                        body,
                        "NEW_BOOKING_ADMIN",
                        booking.getId()
                );
            }
        } catch (Exception exception) {
            logPreparationFailure(booking, exception);
        }
    }

    @Override
    public void sendApprovedBookingToOwner(Booking booking) {
        if (!emailEnabled) {
            return;
        }

        try {
            if (!hasRequiredBookingDetails(booking)) {
                return;
            }

            User owner = booking.getService().getBusiness().getOwner();

            if (!hasEmail(owner)) {
                log.warn(
                        "Approval email skipped for booking {}: owner email is missing.",
                        booking.getId()
                );
                return;
            }

            String subject = "Booking Approved for Your Business - Booky";

            String body = """
                    Hello %s,

                    A booking has been approved for your business.

                    Booking ID: %s

                    Business: %s
                    Service: %s

                    Client: %s
                    Client Email: %s

                    Appointment: %s
                    Price: $%.2f
                    Status: %s

                    Please open your Booky Owner Dashboard for more details.

                    Booky Notifications
                    """.formatted(
                    safeValue(owner.getFullName(), "Business Owner"),
                    booking.getId(),
                    getBusinessName(booking),
                    getServiceName(booking),
                    getClientName(booking),
                    getClientEmail(booking),
                    formatAppointment(booking),
                    getServicePrice(booking),
                    safeValue(booking.getStatus(), "CONFIRMED")
            );

            sendEmailSafely(
                    owner.getEmail(),
                    subject,
                    body,
                    "BOOKING_APPROVED_OWNER",
                    booking.getId()
            );
        } catch (Exception exception) {
            logPreparationFailure(booking, exception);
        }
    }

    @Override
    public void sendDeclinedBookingToOwner(Booking booking) {
        if (!emailEnabled) {
            return;
        }

        try {
            if (!hasRequiredBookingDetails(booking)) {
                return;
            }

            User owner = booking.getService().getBusiness().getOwner();

            if (!hasEmail(owner)) {
                log.warn(
                        "Decline email skipped for booking {}: owner email is missing.",
                        booking.getId()
                );
                return;
            }

            String subject = "Booking Declined for Your Business - Booky";

            String body = """
                    Hello %s,

                    A booking request for your business has been declined by the administrator.

                    Booking ID: %s

                    Business: %s
                    Service: %s

                    Client: %s
                    Client Email: %s

                    Appointment: %s
                    Price: $%.2f
                    Status: %s

                    You can review your booking activity in the Booky Owner Dashboard.

                    Booky Notifications
                    """.formatted(
                    safeValue(owner.getFullName(), "Business Owner"),
                    booking.getId(),
                    getBusinessName(booking),
                    getServiceName(booking),
                    getClientName(booking),
                    getClientEmail(booking),
                    formatAppointment(booking),
                    getServicePrice(booking),
                    safeValue(booking.getStatus(), "CANCELLED")
            );

            sendEmailSafely(
                    owner.getEmail(),
                    subject,
                    body,
                    "BOOKING_DECLINED_OWNER",
                    booking.getId()
            );
        } catch (Exception exception) {
            logPreparationFailure(booking, exception);
        }
    }

    private void sendEmailSafely(
            String recipient,
            String subject,
            String body,
            String notificationType,
            Integer bookingId
    ) {
        if (!emailEnabled || recipient == null || recipient.isBlank()) {
            return;
        }

        EmailNotification notification = new EmailNotification();
        notification.setRecipient(recipient);
        notification.setSubject(subject);
        notification.setNotificationType(notificationType);
        notification.setBookingId(bookingId);
        notification.setStatus("PENDING");
        notification.setCreatedAt(LocalDateTime.now());

        try {
            notification = emailNotificationRepository.save(notification);
        } catch (Exception exception) {
            log.error(
                    "Could not record email notification for booking {}. "
                            + "Email was not attempted. Error type: {}",
                    bookingId,
                    exception.getClass().getSimpleName()
            );
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            notification.setStatus("SENT");
            notification.setSentAt(LocalDateTime.now());
            notification.setErrorMessage(null);

            log.info(
                    "SMTP send completed for booking {} notification {}.",
                    bookingId,
                    notificationType
            );
        } catch (Exception exception) {
            notification.setStatus("FAILED");
            notification.setSentAt(null);
            notification.setErrorMessage(
                    limitErrorMessage(exception.getMessage())
            );

            log.warn(
                    "Email attempt failed for booking {} notification {}. Error type: {}",
                    bookingId,
                    notificationType,
                    exception.getClass().getSimpleName()
            );
        }

        // Save separately so a database failure does not change
        // a successfully sent email's status to FAILED.
        try {
            emailNotificationRepository.save(notification);
        } catch (Exception exception) {
            log.error(
                    "Could not save email delivery status for booking {}. "
                            + "Recorded status may still be PENDING. Error type: {}",
                    bookingId,
                    exception.getClass().getSimpleName()
            );
        }
    }

    private boolean hasRequiredBookingDetails(Booking booking) {
        if (booking == null
                || booking.getService() == null
                || booking.getService().getBusiness() == null) {
            log.warn("Email skipped because required booking details are missing.");
            return false;
        }

        return true;
    }

    private boolean hasEmail(User user) {
        return user != null
                && user.getEmail() != null
                && !user.getEmail().isBlank();
    }

    private String getClientName(Booking booking) {
        return booking.getUser() == null
                ? "Unknown client"
                : safeValue(booking.getUser().getFullName(), "Unknown client");
    }

    private String getClientEmail(Booking booking) {
        return booking.getUser() == null
                ? "Not provided"
                : safeValue(booking.getUser().getEmail(), "Not provided");
    }

    private String getBusinessName(Booking booking) {
        return safeValue(
                booking.getService().getBusiness().getName(),
                "Unknown business"
        );
    }

    private String getServiceName(Booking booking) {
        return safeValue(
                booking.getService().getName(),
                "Unknown service"
        );
    }

    private String formatAppointment(Booking booking) {
        if (booking.getAppointmentTime() == null) {
            return "Not specified";
        }

        // Booky stores appointment times as Lebanon local times.
        return booking.getAppointmentTime().format(DATE_FORMATTER)
                + " (Lebanon time)";
    }

    private double getServicePrice(Booking booking) {
        if (booking.getService() == null
                || booking.getService().getPrice() == null) {
            return 0.0;
        }

        return booking.getService().getPrice();
    }

    private String safeValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String limitErrorMessage(String message) {
        if (message == null || message.isBlank()) {
            return "Unknown email error";
        }

        return message.length() <= 1000
                ? message
                : message.substring(0, 1000);
    }

    private void logPreparationFailure(
            Booking booking,
            Exception exception
    ) {
        log.error(
                "Could not prepare email notification for booking {}. Error type: {}",
                booking == null ? null : booking.getId(),
                exception.getClass().getSimpleName()
        );
    }
}