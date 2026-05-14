package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.QuanHuyen;
import com.nhom26.tutormanagement.entity.PhuongXa;
import com.nhom26.tutormanagement.repository.QuanHuyenRepository;
import com.nhom26.tutormanagement.repository.PhuongXaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dia-chi")
@RequiredArgsConstructor
public class QuanHuyenController {
    private final QuanHuyenRepository quanHuyenRepository;
    private final PhuongXaRepository phuongXaRepository;

    @GetMapping("/quan-huyen")
    public ResponseEntity<List<QuanHuyen>> layDanhSachQuanHuyen() {
        return ResponseEntity.ok(quanHuyenRepository.findAll());
    }

    @GetMapping("/phuong-xa/{idQuanHuyen}")
    public ResponseEntity<List<PhuongXa>> layDanhSachPhuongXa(@PathVariable String idQuanHuyen) {
        return ResponseEntity.ok(phuongXaRepository.findByQuanHuyen_IdQuanHuyen(idQuanHuyen));
    }
}
