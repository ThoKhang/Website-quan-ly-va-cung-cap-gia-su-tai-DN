package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.AuthResponse;
import com.nhom26.tutormanagement.dto.LoginRequest;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        // 1. Tìm tài khoản trong Database
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        // 2. Kiểm tra mật khẩu (Thực tế sẽ dùng PasswordEncoder.matches)
        if (!taiKhoan.getMatKhau().equals(request.getMatKhau())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 3. Tạo Token (Đã sửa lỗi getPhanQuyenNguoiDung)
        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), taiKhoan.getLoaiNguoiDungID());

        // 4. Lấy ID của người dùng (Gia sư hoặc Phụ huynh) để trả về Frontend
        String idNguoiDung = "";
        
        // Trả về response (Đã sửa lỗi getPhanQuyenNguoiDung)
        return new AuthResponse(token, "Đăng nhập thành công!", taiKhoan.getLoaiNguoiDungID(), idNguoiDung);
    }
}