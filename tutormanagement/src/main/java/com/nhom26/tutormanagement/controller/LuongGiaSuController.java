/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.service.TraLuongService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Tho Khang
 */
@RestController
@RequestMapping("/api/admin/luong-gia-su")
@RequiredArgsConstructor
public class LuongGiaSuController {
    
    private final TraLuongService traLuongService;

    // API lấy danh sách gia sư còn lương
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<?> getDanhSachTraLuong() {
        return ResponseEntity.ok(traLuongService.getDanhSachGiaSuCanTraLuong());
    }

    // API thanh toán
    @PostMapping("/thanh-toan")
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<?> thanhToan(@RequestBody Map<String, Object> body) {
        String idGiaSu = (String) body.get("idGiaSu");
        Double soTien = Double.valueOf(body.get("soTien").toString());
        traLuongService.thanhToanLuong(idGiaSu, soTien);
        return ResponseEntity.ok("Thanh toán thành công");
    }
}
