package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ThongKeDoanhThuDTO;
import com.nhom26.tutormanagement.service.ThongKeService;
import com.nhom26.tutormanagement.service.DashboardService; // Thêm dòng này
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thong-ke") // Lưu ý: của bạn có dấu gạch ngang
@CrossOrigin("*") // Thêm dòng này để React gọi không bị lỗi CORS
@RequiredArgsConstructor
public class ThongKeController {
    
    private final ThongKeService thongKeService;
    private final DashboardService dashboardService; // Inject thêm DashboardService

    // API CŨ CỦA BẠN (Dùng để xem chi tiết 1 tháng cụ thể)
    @GetMapping("/doanh-thu")
    public ResponseEntity<ThongKeDoanhThuDTO> xemDoanhThu(
            @RequestParam int thang, 
            @RequestParam int nam) {
        return ResponseEntity.ok(thongKeService.layBaoCaoDoanhThuThang(thang, nam));
    }

    // API MỚI CHO FRONTEND (Trả về mảng 6 tháng để vẽ biểu đồ)
    @GetMapping("/doanh-thu-bieu-do")
    public ResponseEntity<?> xemDoanhThuBieuDo() {
        return ResponseEntity.ok(dashboardService.getDoanhThuTheoThang());
    }
}