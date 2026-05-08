package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.service.GiaSuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gia-su")
@RequiredArgsConstructor
public class GiaSuController {

    private final GiaSuService giaSuService;

    // API: Lấy danh sách lịch rảnh để hiển thị cho Phụ huynh chọn
    @GetMapping("/{idGiaSu}/lich-ranh")
    public ResponseEntity<?> layLichRanh(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layLichRanhCuaGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}