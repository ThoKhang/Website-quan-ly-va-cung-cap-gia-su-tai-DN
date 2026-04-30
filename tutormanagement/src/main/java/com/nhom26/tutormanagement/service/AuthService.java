package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.AuthResponse;
import com.nhom26.tutormanagement.dto.LoginRequest;
import com.nhom26.tutormanagement.dto.RegisterRequest;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.security.JwtService;
import com.nhom26.tutormanagement.util.IdGeneratorUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        // Lấy thông tin đầu vào (có thể là username hoặc email)
        String inputTaiKhoan = request.getTenDangNhap(); 

        System.out.println("========== BẮT ĐẦU TEST LOGIN ==========");
        System.out.println("1. Người dùng nhập tài khoản/email: [" + inputTaiKhoan + "]");

        // Bước 1: Tìm trong DB với điều kiện HOẶC (Username HOẶC Email)
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(inputTaiKhoan, inputTaiKhoan)
                .orElseThrow(() -> new RuntimeException("LỖI BƯỚC 1: Không tìm thấy tài khoản hoặc email [" + inputTaiKhoan + "] trong hệ thống!"));

        // Bước 2: Kiểm tra mật khẩu (Giữ nguyên .trim() cho an toàn)
        String passDB = taiKhoan.getMatKhau() != null ? taiKhoan.getMatKhau().trim() : "";
        String passReq = request.getMatKhau() != null ? request.getMatKhau().trim() : "";

        if (!passDB.equals(passReq)) {
            throw new RuntimeException("LỖI BƯỚC 2: Sai mật khẩu!");
        }

        System.out.println("KẾT QUẢ: MATCH! Đăng nhập thành công!");
        System.out.println("========================================");

        // Bước 3: Tạo Token
        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), taiKhoan.getLoaiNguoiDungID());
        String idNguoiDung = ""; // Sẽ lấy ID sau
        
        return new AuthResponse(token, "Đăng nhập thành công!", taiKhoan.getLoaiNguoiDungID(), idNguoiDung);
    }
    public String register(RegisterRequest request) {
        // Cạo khoảng trắng để so sánh chính xác
        String inputTenDangNhap = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        // 1. Kiểm tra xem Tên đăng nhập hoặc Email đã tồn tại chưa
        if (taiKhoanRepository.findByTenDangNhapOrEmail(inputTenDangNhap, inputEmail).isPresent()) {
            throw new RuntimeException("Tên đăng nhập hoặc Email này đã tồn tại trong hệ thống!");
        }

        // 2. Tạo tài khoản mới (Chỉ lưu vào bảng TaiKhoan)
        TaiKhoan taiKhoanMoi = new TaiKhoan();
        taiKhoanMoi.setIdTaiKhoan(IdGeneratorUtil.generateId());
        taiKhoanMoi.setEmail(inputEmail);
        taiKhoanMoi.setTenDangNhap(inputTenDangNhap);
        taiKhoanMoi.setMatKhau(request.getMatKhau()); // Ở môi trường thực tế sẽ dùng BCrypt
        taiKhoanMoi.setNgayTao(LocalDateTime.now());
        
        // GÁN MẶC ĐỊNH QUYỀN "NGƯỜI DÙNG" 
        // (Thay "1" bằng ID thực tế của quyền Người Dùng trong SQL Server của bạn)
        taiKhoanMoi.setLoaiNguoiDungID("1"); 

        // 3. Lưu xuống Database
        taiKhoanRepository.save(taiKhoanMoi);

        return "Đăng ký tài khoản thành công!";
    }
}