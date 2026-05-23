package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.KhoaHocRequestDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.entity.KhoaHoc;
import com.nhom26.tutormanagement.repository.KhoaHocRepository;
import com.nhom26.tutormanagement.service.KhoaHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/khoa-hoc")
@RequiredArgsConstructor
public class KhoaHocController {
    private final KhoaHocService khoaHocService;
    private final KhoaHocRepository khoaHocRepository;
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
    @PreAuthorize("hasAuthority('ROLE_4')") 
    public ResponseEntity<String> duyetKhoaHoc(@PathVariable String id, @RequestParam Integer status) {
        try {
            return ResponseEntity.ok(khoaHocService.duyetKhoaHoc(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/gia-su/{idGiaSu}")
    public ResponseEntity<?> getKhoaHocByGiaSu(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(khoaHocService.getKhoaHocByGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            //Trả về thông báo lỗi thật để Frontend hiển thị
            return ResponseEntity.badRequest().body(e.getMessage()); 
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
    @PreAuthorize("hasAuthority('ROLE_4')") 
    public ResponseEntity<String> deleteKhoaHoc(@PathVariable String id) {
        try {
            return ResponseEntity.ok(khoaHocService.deleteKhoaHoc(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/admin/khoa-hoc")
        @PreAuthorize("hasAuthority('ROLE_4')") 
        public ResponseEntity<?> layToanBoKhoaHocChoAdmin() {
            try {
                List<KhoaHocResponseDTO> result = khoaHocService.layToanBoKhoaHocChoAdmin();
                return ResponseEntity.ok(result);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }
}
