package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/dat-lop")
    public ResponseEntity<String> datLop(@RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.datLop(request));
    }
}