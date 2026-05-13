package com.nhom26.tutormanagement.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailOtpService {
    private final JavaMailSender javaMailSender;
    private final Map<String, OtpPayload> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${app.mail.otp.expire-minutes:10}")
    private long otpExpireMinutes;

    public void sendForgotPasswordOtp(String email, String tenDangNhap) {
        validateMailConfiguration();

        String normalizedEmail = normalizeEmail(email);
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpireMinutes);

        otpStorage.put(normalizedEmail, new OtpPayload(otpCode, expiresAt));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(normalizedEmail);
        message.setSubject("Ma OTP khoi phuc mat khau");
        message.setText(buildForgotPasswordContent(tenDangNhap, otpCode, expiresAt));

        try {
            javaMailSender.send(message);
        } catch (MailException exception) {
            otpStorage.remove(normalizedEmail);
            throw new RuntimeException("Khong the gui OTP den email nay. Vui long thu lai sau.");
        }
    }

    public boolean isOtpValid(String email, String otpCode) {
        String normalizedEmail = normalizeEmail(email);
        OtpPayload payload = otpStorage.get(normalizedEmail);

        if (payload == null) {
            return false;
        }

        if (payload.expiresAt().isBefore(LocalDateTime.now())) {
            otpStorage.remove(normalizedEmail);
            return false;
        }

        return payload.code().equals(otpCode);
    }

    public void clearOtp(String email) {
        otpStorage.remove(normalizeEmail(email));
    }

    private void validateMailConfiguration() {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Chua cau hinh email gui OTP. Hay cap nhat bien moi truong mail.");
        }
    }

    private String generateOtp() {
        int value = 100000 + random.nextInt(900000);
        return String.valueOf(value);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String buildForgotPasswordContent(String tenDangNhap, String otpCode, LocalDateTime expiresAt) {
        long minutesRemaining = Math.max(1, Duration.between(LocalDateTime.now(), expiresAt).toMinutes());
        return String.join("\n",
                "Xin chao " + tenDangNhap + ",",
                "",
                "He thong Quan Ly va Cung Cap Gia Su tai Da Nang vua nhan yeu cau khoi phuc mat khau.",
                "Ma OTP cua ban la: " + otpCode,
                "Ma nay co hieu luc trong " + minutesRemaining + " phut.",
                "",
                "Neu ban khong thuc hien yeu cau nay, vui long bo qua email nay.");
    }

    private record OtpPayload(String code, LocalDateTime expiresAt) {
    }
}
