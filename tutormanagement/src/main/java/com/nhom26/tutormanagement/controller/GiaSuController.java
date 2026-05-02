
package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.GiaSuProfileDTO;
import com.nhom26.tutormanagement.service.GiaSuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gia-su")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GiaSuController {

    private final GiaSuService giaSuService;

    /*
     * API: Lấy thông tin hồ sơ rút gọn của Gia sư
     * URL: /api/gia-su/{idGiaSu}/ho-so
     */
    @GetMapping("/{idGiaSu}/ho-so")
    public ResponseEntity<GiaSuProfileDTO> layHoSoGiaSu(@PathVariable String idGiaSu) {
        GiaSuProfileDTO profile = giaSuService.layHoSoGiaSu(idGiaSu);
        return ResponseEntity.ok(profile);
    }

    /*
     * API: Kiểm tra điều kiện tạo khóa học
     * URL: /api/gia-su/{idGiaSu}/kiem-tra-dieu-kien
     * Trả về true nếu Gia sư có trangThai = 1 (Đã duyệt), ngược lại trả về false.
     */
    @GetMapping("/{idGiaSu}/kiem-tra-dieu-kien")
    public ResponseEntity<Boolean> kiemTraDieuKienTaoKhoaHoc(@PathVariable String idGiaSu) {
        boolean hopLe = giaSuService.kiemTraDieuKienTaoKhoaHoc(idGiaSu);
        return ResponseEntity.ok(hopLe);
    }
}
