package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ChangePasswordRequestDTO;
import com.nhom26.tutormanagement.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tai-khoan")
@RequiredArgsConstructor
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;

    @PostMapping("/send-change-password-otp")
    public ResponseEntity<?> sendChangePasswordOtp() {
        try {
            String maskedEmail = taiKhoanService.sendChangePasswordOtp();
            return ResponseEntity.ok(maskedEmail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-change-password-otp")
    public ResponseEntity<?> verifyChangePasswordOtp(@RequestBody java.util.Map<String, String> request) {
        try {
            String otp = request.get("otp");
            taiKhoanService.verifyChangePasswordOtp(otp);
            return ResponseEntity.ok("OTP hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/doi-mat-khau")
    public ResponseEntity<?> doiMatKhau(@RequestBody ChangePasswordRequestDTO request) {
        try {
            String message = taiKhoanService.doiMatKhau(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            // Nếu có lỗi (sai pass cũ, không khớp pass mới), trả về HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}