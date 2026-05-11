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
        try {
            return ResponseEntity.ok(khoaHocService.taoKhoaHocVaLichRanh(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    @PutMapping("/{id}/duyet")
    public ResponseEntity<String> duyetKhoaHoc(@PathVariable String id, @RequestParam Integer status) {
        try {
            return ResponseEntity.ok(khoaHocService.duyetKhoaHoc(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/gia-su/{idGiaSu}")
    public ResponseEntity<List<KhoaHocResponseDTO>> getKhoaHocByGiaSu(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(khoaHocService.getKhoaHocByGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhoaHocResponseDTO> getKhoaHocDetail(@PathVariable String id) {
        try {
            return ResponseEntity.ok(khoaHocService.getKhoaHocDetail(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateKhoaHoc(@PathVariable String id, @RequestBody KhoaHocRequestDTO request) {
        try {
            return ResponseEntity.ok(khoaHocService.updateKhoaHoc(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteKhoaHoc(@PathVariable String id) {
        try {
            return ResponseEntity.ok(khoaHocService.deleteKhoaHoc(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
