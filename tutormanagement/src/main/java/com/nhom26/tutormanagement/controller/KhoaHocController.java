package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.KhoaHocRequestDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.service.KhoaHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/khoa-hoc")
@RequiredArgsConstructor
public class KhoaHocController {
    private final KhoaHocService khoaHocService;

    // 1. Gia sư tạo khóa học
    @PostMapping("/tao-moi")
    public ResponseEntity<String> taoKhoaHoc(@RequestBody KhoaHocRequestDTO request) {
        try {
            return ResponseEntity.ok(khoaHocService.taoKhoaHocVaLichRanh(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Học viên/Phụ huynh tìm kiếm khóa học (Chỉ hiện khóa đã duyệt)
    @GetMapping("/tim-kiem")
    public ResponseEntity<List<KhoaHocResponseDTO>> timKiem(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String idMonHoc,
            @RequestParam(required = false) String idDanhMucLop,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(
                khoaHocService.timKiemKhoaHoc(keyword, idMonHoc, idDanhMucLop, minPrice, maxPrice)
        );
    }

    // 3. THÊM MỚI: Admin duyệt khóa học (status = 1: Duyệt, status = 2: Từ chối)
    @PutMapping("/{id}/duyet")
    public ResponseEntity<String> duyetKhoaHoc(@PathVariable String id, @RequestParam Integer status) {
        try {
            return ResponseEntity.ok(khoaHocService.duyetKhoaHoc(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}