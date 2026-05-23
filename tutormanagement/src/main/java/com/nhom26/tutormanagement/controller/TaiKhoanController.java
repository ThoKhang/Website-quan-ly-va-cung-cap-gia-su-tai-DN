package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.ChangePasswordRequestDTO;
import com.nhom26.tutormanagement.dto.TaiKhoanAdminDTO;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.service.TaiKhoanService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tai-khoan")
@RequiredArgsConstructor
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;
    private final UploadController uploadController;
    private final TaiKhoanRepository taiKhoanRepository;
    @PostMapping("/send-change-password-otp")
    public ResponseEntity<?> sendChangePasswordOtp() {
        try {
            String maskedEmail = taiKhoanService.sendChangePasswordOtp();
            return ResponseEntity.ok(maskedEmail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-change-password-otp")
    public ResponseEntity<?> verifyChangePasswordOtp(@RequestBody java.util.Map<String, String> request) {
        try {
            String otp = request.get("otp");
            taiKhoanService.verifyChangePasswordOtp(otp);
            return ResponseEntity.ok("OTP hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/doi-mat-khau")
    public ResponseEntity<?> doiMatKhau(@RequestBody ChangePasswordRequestDTO request) {
        try {
            String message = taiKhoanService.doiMatKhau(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/thong-tin-hien-tai")
    public ResponseEntity<?> getThongTinHienTai() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        TaiKhoan taiKhoan = taiKhoanService.layThongTinTaiKhoanHienTai(currentUsername);
        return ResponseEntity.ok(taiKhoan);
    }

    // ========================================================
    // CÁC API MỚI CHO TRANG THÔNG TIN TÀI KHOẢN (FRONTEND)
    // ========================================================

    @PostMapping("/yeu-cau-doi-email")
    public ResponseEntity<?> yeuCauDoiEmail(@RequestBody Map<String, String> request) {
        try {
            String newEmail = request.get("email");
            taiKhoanService.yeuCauDoiEmail(newEmail);
            return ResponseEntity.ok(Map.of("message", "Đã gửi OTP đến email mới!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/xac-nhan-doi-email")
    public ResponseEntity<?> xacNhanDoiEmail(@RequestBody Map<String, String> request) {
        try {
            String newEmail = request.get("email");
            String otp = request.get("otp");
            taiKhoanService.xacNhanDoiEmail(newEmail, otp);
            return ResponseEntity.ok(Map.of("message", "Cập nhật email thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/cap-nhat-ngan-hang")
    public ResponseEntity<?> capNhatNganHang(@RequestBody Map<String, String> request) {
        try {
            String nganHang = request.get("nganHang");
            String stk = request.get("stk");
            taiKhoanService.capNhatNganHang(nganHang, stk);
            return ResponseEntity.ok(Map.of("message", "Cập nhật ngân hàng thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/cap-nhat-avatar")
    public ResponseEntity<?> capNhatAvatar(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📸 Nhận request upload avatar");

            ResponseEntity<?> uploadResponse = uploadController.uploadFile(file);

            System.out.println("Upload Response Status: " + uploadResponse.getStatusCode());
            System.out.println("Upload Response Body: " + uploadResponse.getBody());

            if (uploadResponse.getStatusCode().isError() || uploadResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Upload file thất bại"));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) uploadResponse.getBody();
            String fileUrl = (String) body.get("fileUrl");

            if (fileUrl == null || fileUrl.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không lấy được fileUrl"));
            }

            String imageUrl = taiKhoanService.capNhatAvatar(fileUrl);

            System.out.println("✅ Avatar cập nhật thành công: " + imageUrl);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật avatar thành công!",
                "anhDaiDien", imageUrl
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    // 1. Thêm /admin vào GetMapping
    @GetMapping("/admin") 
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<List<TaiKhoanAdminDTO>> layToanBoTaiKhoan() {
        List<TaiKhoanAdminDTO> danhSach = taiKhoanRepository.findAll().stream().map(tk -> {
            TaiKhoanAdminDTO dto = new TaiKhoanAdminDTO();
            dto.setIdTaiKhoan(tk.getIdTaiKhoan());
            dto.setTenDangNhap(tk.getTenDangNhap());
            dto.setEmail(tk.getEmail());
            dto.setLoaiNguoiDungID(tk.getLoaiNguoiDungID());
            dto.setTrangThai(tk.getTrangThai() != null ? tk.getTrangThai() : 1);
            dto.setNgayTao(tk.getNgayTao());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(danhSach);
    }

    // 2. Thêm /admin vào PutMapping
    @PutMapping("/admin/{id}/trang-thai") 
    @PreAuthorize("hasAuthority('ROLE_4')")
    public ResponseEntity<String> capNhatTrangThai(@PathVariable String id, @RequestParam Integer trangThai) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
        
        // Cập nhật trạng thái (0: Khóa, 1: Mở)
        taiKhoan.setTrangThai(trangThai);
        taiKhoanRepository.save(taiKhoan);
        
        return ResponseEntity.ok(trangThai == 1 ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản thành công!");
    }
}