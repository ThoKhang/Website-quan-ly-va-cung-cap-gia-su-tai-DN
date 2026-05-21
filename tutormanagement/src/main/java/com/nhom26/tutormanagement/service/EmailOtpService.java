package com.nhom26.tutormanagement.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(new InternetAddress(fromEmail));
            helper.setTo(normalizedEmail);
            helper.setSubject("Mã OTP khôi phục mật khẩu");
            helper.setText(buildForgotPasswordContent(tenDangNhap, otpCode, expiresAt), false);
            javaMailSender.send(mimeMessage);
            
            System.out.println("✅ Gửi OTP thành công đến: " + normalizedEmail);
            
        } catch (MailException | MessagingException exception) {
            System.err.println("=== CHI TIẾT LỖI GỬI MAIL ===");
            exception.printStackTrace(); 
            System.err.println("=============================");
            
            otpStorage.remove(normalizedEmail);
            throw new RuntimeException("Không thể gửi OTP đến email này. Lỗi: " + exception.getMessage());
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
            throw new RuntimeException("Chưa cấu hình email gửi OTP. Hãy cập nhật biến môi trường mail.");
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
                "Xin chào " + tenDangNhap + ",",
                "",
                "Hệ thống Quản Lý và Cung ấp Gia Sư tại Đà Nẵng vừa nhận được yêu cầu khôi phục mật khẩu.",
                "Mã OTP của bạn là: " + otpCode,
                "Mã này có hiệu lực trong " + minutesRemaining + " phút.",
                "",
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.");
    }

    public void sendChangePasswordOtp(String email, String tenDangNhap) {
        validateMailConfiguration();

        String normalizedEmail = normalizeEmail(email);
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpireMinutes);

        otpStorage.put(normalizedEmail, new OtpPayload(otpCode, expiresAt));

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(new InternetAddress(fromEmail));
            helper.setTo(normalizedEmail);
            helper.setSubject("Mã OTP xác nhận đổi mật khẩu");
            helper.setText(buildChangePasswordContent(tenDangNhap, otpCode, expiresAt), false);
            javaMailSender.send(mimeMessage);
            
            System.out.println("✅ Gửi OTP đổi mật khẩu thành công đến: " + normalizedEmail);
            
        } catch (MailException | MessagingException exception) {
            System.err.println("=== CHI TIẾT LỖI GỬI MAIL ===");
            exception.printStackTrace(); 
            System.err.println("=============================");
            
            otpStorage.remove(normalizedEmail);
            throw new RuntimeException("Không thể gửi OTP đến email này. Lỗi: " + exception.getMessage());
        }
    }

    private String buildChangePasswordContent(String tenDangNhap, String otpCode, LocalDateTime expiresAt) {
        long minutesRemaining = Math.max(1, Duration.between(LocalDateTime.now(), expiresAt).toMinutes());
        return String.join("\n",
                "Xin chào " + tenDangNhap + ",",
                "",
                "Hệ thống Quản Lý và Cung ấp Gia Sư tại Đà Nẵng vừa nhận được yêu cầu đổi mật khẩu.",
                "Mã OTP xác nhận của bạn là: " + otpCode,
                "Mã này có hiệu lực trong " + minutesRemaining + " phút.",
                "",
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.");
    }

    private record OtpPayload(String code, LocalDateTime expiresAt) {
    }
}
