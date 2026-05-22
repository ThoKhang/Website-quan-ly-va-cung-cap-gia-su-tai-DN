package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.entity.DangKyHoc; // Đảm bảo import đúng Entity của bạn
import com.nhom26.tutormanagement.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/dat-lop")
    @PreAuthorize("hasAuthority('ROLE_1')") 
    public ResponseEntity<?> datLop(@RequestBody BookingRequestDTO request) {
        try {
            // Hứng kết quả từ Service (yêu cầu Service phải trả về Object)
            var dangKyMoi = bookingService.datLop(request); 

            // Bắt buộc trả về JSON chứa idDangKy
            return ResponseEntity.ok(Map.of(
                "message", "Đặt lớp thành công",
                "idDangKy", dangKyMoi.getIdDangKy() // Lấy mã ID để FE mang đi thanh toán
            ));
        } catch (RuntimeException e) {
            // Trả về lỗi dưới dạng JSON để Frontend dễ hiển thị
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}