package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.DangKyLichRanhRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.service.GiaSuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gia-su")
@RequiredArgsConstructor
public class GiaSuController {

    private final GiaSuService giaSuService;

    // API 1: Lấy danh sách lịch rảnh (Ai cũng xem được, không cần chặn Role)
    @GetMapping("/{idGiaSu}/lich-ranh")
    public ResponseEntity<?> layLichRanh(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layLichRanhCuaGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 2: Gia sư tự tạo hồ sơ chính chủ
    @PostMapping("/tao-moi")
    @PreAuthorize("hasAuthority('2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> taoHoSoGiaSu(@RequestBody GiaSuRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.taoHoSo(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 3: Gia sư tự tải lên Bằng cấp/Chứng chỉ
    @PostMapping("/them-bang-cap")
    @PreAuthorize("hasAuthority('2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> themBangCap(@RequestBody BangCapRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.themBangCap(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 4: Gia sư tự do thêm các khung giờ rảnh của mình   
    @PostMapping("/dang-ky-lich-ranh")
    @PreAuthorize("hasAuthority('2')") // CHỈ GIA SƯ (ID = 2) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> dangKyLichRanh(@RequestBody DangKyLichRanhRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.dangKyLichRanh(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // API: Xem thông tin chi tiết một gia sư kèm số sao đánh giá
    @GetMapping("/{idGiaSu}/chi-tiet")
    public ResponseEntity<?> layChiTietGiaSu(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layChiTietGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}