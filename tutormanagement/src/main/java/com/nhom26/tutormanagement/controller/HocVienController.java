package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.HocVien;
import com.nhom26.tutormanagement.service.HocVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoc-vien")
@RequiredArgsConstructor
public class HocVienController {
    private final HocVienService hocVienService;

    @PostMapping("/tao-moi")
    public ResponseEntity<HocVien> taoHocVien(@RequestBody HocVien hocVien) {
        return ResponseEntity.ok(hocVienService.save(hocVien));
    }
}