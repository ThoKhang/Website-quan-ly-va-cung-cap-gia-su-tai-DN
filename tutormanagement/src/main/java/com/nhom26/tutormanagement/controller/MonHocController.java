package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.MonHoc;
import com.nhom26.tutormanagement.repository.MonHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mon-hoc")
@RequiredArgsConstructor
public class MonHocController {
    private final MonHocRepository monHocRepository;

    @GetMapping
    public ResponseEntity<List<MonHoc>> layDanhSachMonHoc() {
        return ResponseEntity.ok(monHocRepository.findAll());
    }
}
