package com.hussein.booky.service.impl;

import com.hussein.booky.entity.Booking;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.service.EmailService;
import com.hussein.booky.entity.EmailNotification;
import com.hussein.booky.repository.EmailNotificationRepository;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final EmailNotificationRepository emailNotificationRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd MMMM yyyy 'at' hh:mm a"
            );

    public EmailServiceImpl(
        JavaMailSender mailSender,
        UserRepository userRepository,
        EmailNotificationRepository emailNotificationRepository
) {
    this.mailSender = mailSender;
    this.userRepository = userRepository;
    this.emailNotificationRepository =
            emailNotificationRepository;
}

    @Override
    public void sendNewBookingToAdmins(Booking booking) {

        List<User> admins =
                userRepository.findByRole("ADMIN");

        if (admins.isEmpty()) {
            System.err.println(
                    "Booking email not sent: no admin accounts found."
            );
            return;
        }

        for (User admin : admins) {

            if (admin.getEmail() == null ||
                    admin.getEmail().isBlank()) {
                continue;
            }

            /*
             * Do not notify frozen administrators.
             */
            if (admin.isFrozen()) {
                continue;
            }

            String subject =
                    "New Booking Requires Approval - Booky";

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
                    safeValue(
                            booking.getUser().getFullName(),
                            "Unknown client"
                    ),
                    safeValue(
                            booking.getUser().getEmail(),
                            "Not provided"
                    ),
                    safeValue(
                            booking.getService()
                                    .getBusiness()
                                    .getName(),
                            "Unknown business"
                    ),
                    safeValue(
                            booking.getService().getName(),
                            "Unknown service"
                    ),
                    formatAppointment(booking),
                    getServicePrice(booking),
                    safeValue(
                            booking.getStatus(),
                            "PENDING"
                    )
            );

            sendEmailSafely(
        admin.getEmail(),
        subject,
        body,
        "NEW_BOOKING_ADMIN",
        booking.getId()
);
        }
    }
    @Override
public void sendDeclinedBookingToOwner(Booking booking) {

    User owner = booking.getService()
            .getBusiness()
            .getOwner();

    if (owner == null) {
        System.err.println(
                "Decline email not sent: business has no owner."
        );
        return;
    }

    if (owner.getEmail() == null ||
            owner.getEmail().isBlank()) {

        System.err.println(
                "Decline email not sent: owner has no email."
        );
        return;
    }

    String subject =
            "Booking Declined for Your Business - Booky";

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
            safeValue(
                    owner.getFullName(),
                    "Business Owner"
            ),
            booking.getId(),
            safeValue(
                    booking.getService()
                            .getBusiness()
                            .getName(),
                    "Unknown business"
            ),
            safeValue(
                    booking.getService().getName(),
                    "Unknown service"
            ),
            safeValue(
                    booking.getUser().getFullName(),
                    "Unknown client"
            ),
            safeValue(
                    booking.getUser().getEmail(),
                    "Not provided"
            ),
            formatAppointment(booking),
            getServicePrice(booking),
            safeValue(
                    booking.getStatus(),
                    "CANCELLED"
            )
    );
sendEmailSafely(
        owner.getEmail(),
        subject,
        body,
        "BOOKING_DECLINED_OWNER",
        booking.getId()
);
}

    @Override
    public void sendApprovedBookingToOwner(
            Booking booking
    ) {

        User owner =
                booking.getService()
                        .getBusiness()
                        .getOwner();

        if (owner == null) {
            System.err.println(
                    "Approval email not sent: business has no owner."
            );
            return;
        }

        if (owner.getEmail() == null ||
                owner.getEmail().isBlank()) {
            System.err.println(
                    "Approval email not sent: owner has no email."
            );
            return;
        }

        String subject =
                "Booking Approved for Your Business - Booky";

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
                safeValue(
                        booking.getService()
                                .getBusiness()
                                .getName(),
                        "Unknown business"
                ),
                safeValue(
                        booking.getService().getName(),
                        "Unknown service"
                ),
                safeValue(
                        booking.getUser().getFullName(),
                        "Unknown client"
                ),
                safeValue(
                        booking.getUser().getEmail(),
                        "Not provided"
                ),
                formatAppointment(booking),
                getServicePrice(booking),
                safeValue(
                        booking.getStatus(),
                        "CONFIRMED"
                )
        );

        sendEmailSafely(
        owner.getEmail(),
        subject,
        body,
        "BOOKING_APPROVED_OWNER",
        booking.getId()
);
    }
private void sendEmailSafely(
        String recipient,
        String subject,
        String body,
        String notificationType,
        Integer bookingId
) {
    EmailNotification notification =
            new EmailNotification();

    notification.setRecipient(recipient);
    notification.setSubject(subject);
    notification.setNotificationType(notificationType);
    notification.setBookingId(bookingId);
    notification.setStatus("PENDING");
    notification.setCreatedAt(LocalDateTime.now());

    notification =
            emailNotificationRepository.save(notification);

    try {
        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        notification.setStatus("SENT");
        notification.setSentAt(LocalDateTime.now());
        notification.setErrorMessage(null);

        emailNotificationRepository.save(notification);

        System.out.println(
                "Booky email sent successfully to: "
                        + recipient
        );

    } catch (Exception exception) {

        notification.setStatus("FAILED");
        notification.setSentAt(null);
        notification.setErrorMessage(
                limitErrorMessage(exception.getMessage())
        );

        emailNotificationRepository.save(notification);

        System.err.println(
                "Booky email failed for "
                        + recipient
                        + ": "
                        + exception.getMessage()
        );
    }
}
private String limitErrorMessage(String message) {

    if (message == null || message.isBlank()) {
        return "Unknown email error";
    }

    if (message.length() <= 1000) {
        return message;
    }

    return message.substring(0, 1000);
}
    private String formatAppointment(
            Booking booking
    ) {
        if (booking.getAppointmentTime() == null) {
            return "Not specified";
        }

        return booking.getAppointmentTime()
                .format(DATE_FORMATTER);
    }

    private double getServicePrice(
            Booking booking
    ) {
        if (booking.getService() == null ||
                booking.getService().getPrice() == null) {
            return 0.0;
        }

        return booking.getService().getPrice();
    }

    private String safeValue(
            String value,
            String fallback
    ) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value;
    }
}