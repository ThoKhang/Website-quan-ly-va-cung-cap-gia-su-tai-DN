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

    @PostMapping("/tao-moi")
    public ResponseEntity<String> taoKhoaHoc(@RequestBody KhoaHocRequestDTO request) {
        return ResponseEntity.ok(khoaHocService.taoKhoaHocVaLichRanh(request));
    }

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
}
