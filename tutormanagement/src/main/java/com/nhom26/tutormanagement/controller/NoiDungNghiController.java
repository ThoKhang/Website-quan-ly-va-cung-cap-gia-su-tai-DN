package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.service.NoiDungNghiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/nghi-hoc")
@RequiredArgsConstructor
public class NoiDungNghiController {

    private final NoiDungNghiService noiDungNghiService;

    @PostMapping("/xin-nghi")
    @PreAuthorize("hasAuthority('ROLE_1')") // CHỈ PHỤ HUYNH MỚI ĐƯỢC XIN NGHỈ
    public ResponseEntity<?> xinNghiHoc(@RequestBody Map<String, String> request) {
        try {
            String idLichHoc = request.get("idLichHoc");
            String lyDoNghi = request.get("lyDoNghi");
            return ResponseEntity.ok(noiDungNghiService.xinNghiHoc(idLichHoc, lyDoNghi));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}