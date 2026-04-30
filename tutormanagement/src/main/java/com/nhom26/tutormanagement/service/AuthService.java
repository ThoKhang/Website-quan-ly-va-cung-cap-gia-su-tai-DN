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
        // --- ĐOẠN CODE DEBUG 
        System.out.println("========== BẮT ĐẦU TEST LOGIN ==========");
        System.out.println("1. Postman gửi Tên đăng nhập: [" + request.getTenDangNhap() + "]");
        System.out.println("2. Postman gửi Mật khẩu     : [" + request.getMatKhau() + "]");

        // Bước 1: Tìm tài khoản (Đã đổi câu thông báo để biết lỗi ở đâu)
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> new RuntimeException("LỖI BƯỚC 1: Hoàn toàn không tìm thấy Tên đăng nhập [" + request.getTenDangNhap() + "] trong CSDL!"));

        // Nếu qua được Bước 1, in tiếp ra mật khẩu lấy từ DB
        System.out.println("3. DB trả về Mật khẩu gốc   : [" + taiKhoan.getMatKhau() + "]");

        // Bước 2: Kiểm tra mật khẩu (Dùng trim() cho cả 2 bên phòng hờ Postman vô tình dính dấu cách ẩn)
        String passDB = taiKhoan.getMatKhau() != null ? taiKhoan.getMatKhau().trim() : "";
        String passReq = request.getMatKhau() != null ? request.getMatKhau().trim() : "";

        if (!passDB.equals(passReq)) {
            System.out.println("4. KẾT QUẢ: Mật khẩu DB [" + passDB + "] KHÔNG GIỐNG mật khẩu Postman [" + passReq + "]");
            throw new RuntimeException("LỖI BƯỚC 2: Sai mật khẩu!");
        }

        System.out.println("4. KẾT QUẢ: MATCH! Đăng nhập thành công!");
        System.out.println("========================================");

        // Bước 3: Tạo Token
        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), taiKhoan.getLoaiNguoiDungID());
        String idNguoiDung = "";
        
        return new AuthResponse(token, "Đăng nhập thành công!", taiKhoan.getLoaiNguoiDungID(), idNguoiDung);
    }
}