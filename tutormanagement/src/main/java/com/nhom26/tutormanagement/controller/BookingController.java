package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/dat-lop")
    @PreAuthorize("hasAuthority('1')") // CHỈ PHỤ HUYNH (ID = 1) MỚI CÓ QUYỀN GỌI API ĐẶT LỚP NÀY
    public ResponseEntity<?> datLop(@RequestBody BookingRequestDTO request) {
        try {
            return ResponseEntity.ok(bookingService.datLop(request));
        } catch (RuntimeException e) {
            // Hứng lỗi (Exception) từ Service và trả về dưới dạng JSON Bad Request (Status 400)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}