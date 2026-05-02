
package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.LopHocDTO;
import com.nhom26.tutormanagement.dto.MonHocDTO;
import com.nhom26.tutormanagement.dto.TietHocDTO;
import com.nhom26.tutormanagement.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class DanhMucController {

    private final DanhMucService danhMucService;

    /*
     * API: Lấy danh sách Môn Học
     * URL: /api/danh-muc/mon-hoc
     */
    @GetMapping("/mon-hoc")
    public ResponseEntity<List<MonHocDTO>> layDanhSachMonHoc() {
        List<MonHocDTO> danhSach = danhMucService.layDanhSachMonHoc();
        return ResponseEntity.ok(danhSach);
    }

    /*
     * API: Lấy danh sách Lớp Học
     * URL: /api/danh-muc/lop-hoc
     */
    @GetMapping("/lop-hoc")
    public ResponseEntity<List<LopHocDTO>> layDanhSachLopHoc() {
        List<LopHocDTO> danhSach = danhMucService.layDanhSachLopHoc();
        return ResponseEntity.ok(danhSach);
    }

    /*
     * API: Lấy danh sách Tiết Học (Khung giờ)
     * URL: /api/danh-muc/tiet-hoc
     */
    @GetMapping("/tiet-hoc")
    public ResponseEntity<List<TietHocDTO>> layDanhSachTietHoc() {
        List<TietHocDTO> danhSach = danhMucService.layDanhSachTietHoc();
        return ResponseEntity.ok(danhSach);
    }
}