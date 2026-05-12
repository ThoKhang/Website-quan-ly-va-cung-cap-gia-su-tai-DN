package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.dto.PhuHuynhUpdateDTO;
import com.nhom26.tutormanagement.service.PhuHuynhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phu-huynh")
@RequiredArgsConstructor
public class PhuHuynhController {
    private final PhuHuynhService phuHuynhService;

    @PostMapping("/tao-moi")
    @PreAuthorize("hasAuthority('1')") // CHỈ PHỤ HUYNH (ID = 1) MỚI ĐƯỢC GỌI
    public ResponseEntity<?> taoPhuHuynh(@RequestBody PhuHuynh phuHuynh) {
        try {
            return ResponseEntity.ok(phuHuynhService.save(phuHuynh));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/thong-tin-hien-tai")
    @PreAuthorize("hasAuthority('1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC GỌI
    public ResponseEntity<?> layThongTinHienTai() {
        try {
            return ResponseEntity.ok(phuHuynhService.layThongTinHienTai());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/cap-nhat")
    @PreAuthorize("hasAuthority('1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC GỌI
    public ResponseEntity<?> capNhatThongTin(@RequestBody PhuHuynhUpdateDTO phuHuynh) {
        try {
            return ResponseEntity.ok(phuHuynhService.capNhatThongTin(phuHuynh));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}