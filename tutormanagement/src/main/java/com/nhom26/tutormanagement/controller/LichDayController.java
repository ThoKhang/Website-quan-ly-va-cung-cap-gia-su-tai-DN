
package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.LichDayRequestDTO;
import com.nhom26.tutormanagement.service.LichDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lich-day")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class LichDayController {

    private final LichDayService lichDayService;

    /*
     * API: Đăng ký hàng loạt khung giờ rảnh cho Gia sư
     * URL: /api/lich-day/dang-ky-hang-loat
     * Body (JSON): 
     * {
     *    "idGiaSu": "GS001",
     *    "danhSachIdTietHoc": ["TH01", "TH02", "TH03"]
     * }
     */
    @PostMapping("/dang-ky-hang-loat")
    public ResponseEntity<String> dangKyLichRanhHangLoat(@RequestBody LichDayRequestDTO request) {
        try {
            if (request.getIdGiaSu() == null || request.getDanhSachIdTietHoc() == null || request.getDanhSachIdTietHoc().isEmpty()) {
                return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ. Vui lòng chọn ít nhất một khung giờ.");
            }

            lichDayService.dangKyLichRanhHàngLoat(request);
            
            return ResponseEntity.ok("Đăng ký lịch rảnh thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Đã xảy ra lỗi hệ thống khi đăng ký lịch.");
        }
    }
}