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

    // API: Cập nhật tiết học
    @PutMapping("/{idTietHoc}")
    public ResponseEntity<?> capNhatTietHoc(@PathVariable String idTietHoc, @RequestBody TietHocRequestDTO request) {
        try {
            return ResponseEntity.ok(tietHocService.capNhatTietHoc(idTietHoc, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping
    public ResponseEntity<?> getAllTietHoc() {
        try {
            // Gọi qua Service hoặc gọi thẳng Repository (nếu bạn chưa viết Service cho hàm này)
            // Giả sử bạn gọi qua Service:
            return ResponseEntity.ok(tietHocService.getAllTietHoc()); 
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
