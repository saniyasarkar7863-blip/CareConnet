package com.careconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${careconnect.mail.from:noreply@careconnect.com}")
    private String mailFrom;

    public boolean isConfigured() {
        return mailHost != null && !mailHost.isBlank() && !mailHost.equals("none");
    }

    public boolean sendOtpEmail(String recipientEmail, String otp) {
        if (!isConfigured()) {
            log.warn(
                    "SMTP is not configured. To deliver real emails, set SPRING_MAIL_HOST, " +
                    "SPRING_MAIL_PORT, SPRING_MAIL_USERNAME, and SPRING_MAIL_PASSWORD. " +
                    "Recipient: {}",
                    recipientEmail
            );
            return false;
        }

        try {
            // Note: Never log the OTP value to logs!
            log.info("Sending OTP email to recipient: {} via host: {}", recipientEmail, mailHost);

            // Standard JavaMail dispatch
            java.util.Properties props = new java.util.Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", mailHost);
            props.put("mail.smtp.port", String.valueOf(mailPort));

            jakarta.mail.Session session = jakarta.mail.Session.getInstance(props, new jakarta.mail.Authenticator() {
                @Override
                protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                    return new jakarta.mail.PasswordAuthentication(mailUsername, mailPassword);
                }
            });

            jakarta.mail.internet.MimeMessage message = new jakarta.mail.internet.MimeMessage(session);
            message.setFrom(new jakarta.mail.internet.InternetAddress(mailFrom));
            message.setRecipient(jakarta.mail.Message.RecipientType.TO, new jakarta.mail.internet.InternetAddress(recipientEmail));
            message.setSubject("CareConnect — Verify Your Email");
            message.setText("Welcome to CareConnect!\n\nYour 6-digit verification code is: " + otp +
                    "\n\nThis code will expire in 5 minutes. Please do not share this code with anyone.");

            jakarta.mail.Transport.send(message);
            log.info("OTP email successfully sent to {}", recipientEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", recipientEmail, e.getMessage());
            return false;
        }
    }
}

