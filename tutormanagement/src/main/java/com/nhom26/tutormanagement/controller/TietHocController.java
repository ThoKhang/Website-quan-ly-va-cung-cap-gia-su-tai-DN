package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.TietHocRequestDTO;
import com.nhom26.tutormanagement.service.TietHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/tiet-hoc")
@RequiredArgsConstructor
public class TietHocController {

    private final TietHocService tietHocService;

    // API: Tạo tiết học mới (động)
    @PostMapping("/tao-moi")
    public ResponseEntity<?> taoTietHocMoi(@RequestBody TietHocRequestDTO request) {
        try {
            return ResponseEntity.ok(tietHocService.taoTietHocMoi(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
