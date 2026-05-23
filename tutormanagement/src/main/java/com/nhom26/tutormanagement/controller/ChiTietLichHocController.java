package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ChiTietLichHocDTO;
import com.nhom26.tutormanagement.service.ChiTietLichHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-lich-hoc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChiTietLichHocController {
    
    private final ChiTietLichHocService chiTietLichHocService;

    /**
     * Lấy chi tiết lịch học theo ID đăng ký
     * GET /api/chi-tiet-lich-hoc/dang-ky/{idDangKy}
     */
    @GetMapping("/dang-ky/{idDangKy}")
    public ResponseEntity<List<ChiTietLichHocDTO>> getScheduleDetailByDangKy(@PathVariable String idDangKy) {
        List<ChiTietLichHocDTO> result = chiTietLichHocService.getScheduleDetailByDangKy(idDangKy);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy số buổi đã nghỉ trong khóa học
     * GET /api/chi-tiet-lich-hoc/dang-ky/{idDangKy}/so-buoi-nghi
     */
    @GetMapping("/dang-ky/{idDangKy}/so-buoi-nghi")
    public ResponseEntity<Long> getAbsenceCount(@PathVariable String idDangKy) {
        Long count = chiTietLichHocService.getAbsenceCount(idDangKy);
        return ResponseEntity.ok(count);
    }
}