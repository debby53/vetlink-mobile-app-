package com.vetLiink.Backend.service;

import com.vetLiink.Backend.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final String mailHost;
    private final String mailFrom;

    public EmailNotificationService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.mail.from:no-reply@vetlink.com}") String mailFrom) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.mailHost = mailHost == null ? "" : mailHost.trim();
        this.mailFrom = (mailFrom == null || mailFrom.isBlank()) ? "no-reply@vetlink.com" : mailFrom.trim();
    }

    public void sendApprovalEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            logger.info("Skipping approval email because the user email is missing.");
            return;
        }

        String roleLabel = switch (user.getRole()) {
            case VETERINARIAN -> "veterinarian";
            case CAHW -> "CAHW";
            case FARMER -> "farmer";
            case ADMIN -> "administrator";
        };

        String subject = "Your VetLink account has been approved";
        String body = String.format(
                "Hello %s,%n%nYour VetLink %s account has been approved. You can now sign in and access your dashboard.%n%nThank you,%nVetLink Team",
                user.getName(),
                roleLabel
        );

        sendEmail(user.getEmail(), subject, body);
    }

    public void sendRejectionEmail(User user, String rejectionReason) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            logger.info("Skipping rejection email because the user email is missing.");
            return;
        }

        String roleLabel = switch (user.getRole()) {
            case VETERINARIAN -> "veterinarian";
            case CAHW -> "CAHW";
            case FARMER -> "farmer";
            case ADMIN -> "administrator";
        };

        String subject = "Your VetLink account application needs attention";
        String body = String.format(
                "Hello %s,%n%nYour VetLink %s application could not be approved at this time.%n%nReason: %s%n%nPlease update your information and contact the administrator if you need help.%n%nThank you,%nVetLink Team",
                user.getName(),
                roleLabel,
                (rejectionReason == null || rejectionReason.isBlank()) ? "No reason was provided." : rejectionReason
        );

        sendEmail(user.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null || mailHost.isBlank()) {
            logFallback(to, subject, body, "SMTP is not configured");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Approval email sent to {}", to);
        } catch (Exception exception) {
            logger.warn("Email delivery failed for {}. Falling back to log output: {}", to, exception.getMessage());
            logFallback(to, subject, body, "Email delivery failed");
        }
    }

    private void logFallback(String to, String subject, String body, String reason) {
        logger.info("Approval email fallback engaged: {}", reason);
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Body:\n{}", body);
    }
}
