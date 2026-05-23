package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.DangKyLichRanhRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.service.GiaSuService;
import com.nhom26.tutormanagement.service.LichDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/gia-su")
@RequiredArgsConstructor
public class GiaSuController {

    private final GiaSuService giaSuService;
    private final LichDayService lichDayService;
    // API 1: Lấy danh sách lịch rảnh
    @GetMapping("/{idGiaSu}/lich-ranh")
    public ResponseEntity<?> layLichRanh(@PathVariable String idGiaSu) {
        try {
            // SỬA TỪ giaSuService THÀNH lichDayService
            return ResponseEntity.ok(lichDayService.getLichRanhCuaGiaSu(idGiaSu)); 
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API 2: Gia sư tự tạo hồ sơ chính chủ
    @PostMapping("/tao-moi")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> taoHoSoGiaSu(@RequestBody GiaSuRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.taoHoSo(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API 3: Gia sư tự tải lên Bằng cấp/Chứng chỉ
    @PostMapping("/them-bang-cap")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> themBangCap(@RequestBody BangCapRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.themBangCap(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API 4: Gia sư tự do thêm các khung giờ rảnh của mình   
    @PostMapping("/dang-ky-lich-ranh")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> dangKyLichRanh(@RequestBody DangKyLichRanhRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.dangKyLichRanh(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    // API: Xem thông tin chi tiết một gia sư kèm số sao đánh giá
    @GetMapping("/{idGiaSu}/chi-tiet")
    public ResponseEntity<?> layChiTietGiaSu(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layChiTietGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API: Lấy thông tin hồ sơ gia sư (để cập nhật)
    @GetMapping("/{idGiaSu}")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> layThongTinGiaSu(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layThongTinGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API: Cập nhật thông tin hồ sơ gia sư
    @PutMapping("/{idGiaSu}")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> capNhatThongTinGiaSu(@PathVariable String idGiaSu, @RequestBody GiaSuRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.capNhatThongTinGiaSu(idGiaSu, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API: Xóa lịch rảnh
    @DeleteMapping("/lich-ranh/{idLichDay}")
    @PreAuthorize("hasAuthority('ROLE_2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> xoaLichRanh(@PathVariable String idLichDay) {
        try {
            return ResponseEntity.ok(giaSuService.xoaLichRanh(idLichDay));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    // Thêm API này vào GiaSuController.java

    @GetMapping("/thong-tin-hien-tai")
    public ResponseEntity<?> getThongTinHienTai() {
        try {
            return ResponseEntity.ok(giaSuService.layThongTinHienTai());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/bang-cap/{id}")
    public ResponseEntity<?> xoaBangCap(@PathVariable String id) {
        try {
            giaSuService.xoaBangCap(id);
            return ResponseEntity.ok(Map.of("message", "Xóa bằng cấp thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    // Lấy tất cả bằng cấp cho admin
    @GetMapping("/admin/bang-cap")
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<?> layToanBoBangCapChoAdmin() {
        return ResponseEntity.ok(giaSuService.layToanBoBangCapChoAdmin());
    }

    // Duyệt/từ chối bằng cấp
    @PutMapping("/admin/bang-cap/{idBangCap}/duyet")
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<?> duyetBangCap(
            @PathVariable String idBangCap,
            @RequestParam boolean trangThai) {
        try {
            return ResponseEntity.ok(giaSuService.duyetBangCap(idBangCap, trangThai));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}