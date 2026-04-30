package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.service.PhuHuynhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phu-huynh")
@RequiredArgsConstructor
public class PhuHuynhController {
    private final PhuHuynhService phuHuynhService;

    @PostMapping("/tao-moi")
    public ResponseEntity<?> taoPhuHuynh(@RequestBody PhuHuynh phuHuynh) {
        return ResponseEntity.ok(phuHuynhService.save(phuHuynh));
    }
}