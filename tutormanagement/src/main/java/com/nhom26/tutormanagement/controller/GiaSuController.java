package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.service.GiaSuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gia-su")
@RequiredArgsConstructor
public class GiaSuController {

    private final GiaSuService giaSuService;

    // API 1: Lấy danh sách lịch rảnh để hiển thị cho Phụ huynh chọn
    @GetMapping("/{idGiaSu}/lich-ranh")
    public ResponseEntity<?> layLichRanh(@PathVariable String idGiaSu) {
        try {
            return ResponseEntity.ok(giaSuService.layLichRanhCuaGiaSu(idGiaSu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 2: Gia sư tự tạo hồ sơ chính chủ
    @PostMapping("/tao-moi")
    public ResponseEntity<?> taoHoSoGiaSu(@RequestBody GiaSuRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.taoHoSo(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 3: Gia sư tự tải lên Bằng cấp/Chứng chỉ
    @PostMapping("/them-bang-cap")
    public ResponseEntity<?> themBangCap(@RequestBody BangCapRequestDTO request) {
        try {
            return ResponseEntity.ok(giaSuService.themBangCap(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}