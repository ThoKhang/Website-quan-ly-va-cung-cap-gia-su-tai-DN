package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.DanhGiaRequestDTO;
import com.nhom26.tutormanagement.service.DanhGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/danh-gia")
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    @PostMapping("/tao-moi")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC ĐÁNH GIÁ
    public ResponseEntity<?> taoDanhGia(@RequestBody DanhGiaRequestDTO request) {
        try {
            return ResponseEntity.ok(danhGiaService.taoDanhGia(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dang-ky/{idDangKy}")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC XEM
    public ResponseEntity<?> getDanhGiaByDangKy(@PathVariable String idDangKy) {
        try {
            return ResponseEntity.ok(danhGiaService.getDanhGiaByDangKy(idDangKy.trim()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/cap-nhat/{idDangKy}")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC CHỈNH SỬA
    public ResponseEntity<?> capNhatDanhGia(@PathVariable String idDangKy, @RequestBody DanhGiaRequestDTO request) {
        try {
            return ResponseEntity.ok(danhGiaService.capNhatDanhGia(idDangKy.trim(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}