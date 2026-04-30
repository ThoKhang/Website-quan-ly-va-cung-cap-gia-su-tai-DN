package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ThongKeDoanhThuDTO;
import com.nhom26.tutormanagement.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {
    private final ThongKeService thongKeService;

    @GetMapping("/doanh-thu")
    public ResponseEntity<ThongKeDoanhThuDTO> xemDoanhThu(
            @RequestParam int thang, 
            @RequestParam int nam) {
        return ResponseEntity.ok(thongKeService.layBaoCaoDoanhThuThang(thang, nam));
    }
}