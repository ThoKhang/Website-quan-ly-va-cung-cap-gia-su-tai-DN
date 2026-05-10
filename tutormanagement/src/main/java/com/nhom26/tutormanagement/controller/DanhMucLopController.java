package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.DanhMucLop;
import com.nhom26.tutormanagement.repository.DanhMucLopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc-lop")
@RequiredArgsConstructor
public class DanhMucLopController {
    private final DanhMucLopRepository danhMucLopRepository;

    @GetMapping
    public ResponseEntity<List<DanhMucLop>> layDanhSachDanhMucLop() {
        return ResponseEntity.ok(danhMucLopRepository.findAll());
    }
}
