package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import com.nhom26.tutormanagement.service.LichSuThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/thanh-toan")
@CrossOrigin("*")
@RequiredArgsConstructor
public class LichSuThanhToanController {

    private final LichSuThanhToanService lichSuThanhToanService;

    /**
     * POST /api/thanh-toan/xac-nhan
     * Body: { idDangKy, soTien, phuongThuc, maGiaoDich }
     */
    @PostMapping("/xac-nhan")
    public ResponseEntity<?> xacNhanThanhToan(@RequestBody Map<String, String> body) {
        try {
            String idDangKy   = body.get("idDangKy");
            BigDecimal soTien = new BigDecimal(body.get("soTien"));
            String phuongThuc = body.getOrDefault("phuongThuc", "Chuyển khoản");
            String maGiaoDich = body.get("maGiaoDich"); // có thể null

            LichSuThanhToan result = lichSuThanhToanService.luuThanhToan(
                    idDangKy, soTien, phuongThuc, maGiaoDich);

            return ResponseEntity.ok(Map.of(
                    "message", "Thanh toán thành công",
                    "idThanhToan", result.getIdThanhToan(),
                    "trangThai", result.getTrangThai()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}