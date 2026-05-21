package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ChangePasswordRequestDTO;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/thong-tin-hien-tai")
    public ResponseEntity<?> getThongTinHienTai() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        TaiKhoan taiKhoan = taiKhoanService.layThongTinTaiKhoanHienTai(currentUsername);
        return ResponseEntity.ok(taiKhoan);
    }

    // ========================================================
    // CÁC API MỚI CHO TRANG THÔNG TIN TÀI KHOẢN (FRONTEND)
    // ========================================================

    @PostMapping("/yeu-cau-doi-email")
    public ResponseEntity<?> yeuCauDoiEmail(@RequestBody Map<String, String> request) {
        try {
            String newEmail = request.get("email");
            taiKhoanService.yeuCauDoiEmail(newEmail);
            return ResponseEntity.ok(Map.of("message", "Đã gửi OTP đến email mới!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/xac-nhan-doi-email")
    public ResponseEntity<?> xacNhanDoiEmail(@RequestBody Map<String, String> request) {
        try {
            String newEmail = request.get("email");
            String otp = request.get("otp");
            taiKhoanService.xacNhanDoiEmail(newEmail, otp);
            return ResponseEntity.ok(Map.of("message", "Cập nhật email thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/cap-nhat-ngan-hang")
    public ResponseEntity<?> capNhatNganHang(@RequestBody Map<String, String> request) {
        try {
            String nganHang = request.get("nganHang");
            String stk = request.get("stk");
            taiKhoanService.capNhatNganHang(nganHang, stk);
            return ResponseEntity.ok(Map.of("message", "Cập nhật ngân hàng thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}