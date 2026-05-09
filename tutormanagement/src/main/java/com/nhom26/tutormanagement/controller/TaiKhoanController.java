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