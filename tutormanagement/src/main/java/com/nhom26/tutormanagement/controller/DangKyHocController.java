package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.DangKyHocResponseDTO;
import com.nhom26.tutormanagement.dto.GiaHanKhoaHocRequestDTO;
import com.nhom26.tutormanagement.service.DangKyHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dang-ky-hoc")
@RequiredArgsConstructor
public class DangKyHocController {

    private final DangKyHocService dangKyHocService;

    /**
     * Lấy danh sách khóa học đã đăng ký của phụ huynh (Lịch sử)
     * GET /api/dang-ky-hoc/phu-huynh/{idPhuHuynh}
     */
    @GetMapping("/phu-huynh/{idPhuHuynh}")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC GỌI
    public ResponseEntity<?> layLichSuKhoaHoc(@PathVariable String idPhuHuynh) {
        try {
            List<DangKyHocResponseDTO> lichSu = dangKyHocService.layLichSuKhoaHoc(idPhuHuynh);
            return ResponseEntity.ok(lichSu);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Lấy chi tiết một khóa học đã đăng ký
     * GET /api/dang-ky-hoc/{idDangKy}
     */
    @GetMapping("/{idDangKy}")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC GỌI
    public ResponseEntity<?> layChiTietDangKyHoc(@PathVariable String idDangKy) {
        try {
            DangKyHocResponseDTO detail = dangKyHocService.layChiTietDangKyHoc(idDangKy);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{idDangKy}/gui-gia-han")
    @PreAuthorize("hasAuthority('ROLE_1')") 
    public ResponseEntity<?> guiYeuCauGiaHan(
            @PathVariable String idDangKy, 
            @RequestBody GiaHanKhoaHocRequestDTO request) {
        try {
            // Gọi hàm mới trong Service
            String message = dangKyHocService.guiYeuCauGiaHan(
                idDangKy, 
                request.getSoBuoiGiaHan(), 
                request.getLoaiGiaHan()
            );
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
