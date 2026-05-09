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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public String register(RegisterRequest request) {
        String inputTenDangNhap = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        if (taiKhoanRepository.findByTenDangNhapOrEmail(inputTenDangNhap, inputEmail).isPresent()) {
            throw new RuntimeException("Tên đăng nhập hoặc Email này đã tồn tại trong hệ thống!");
        }

        TaiKhoan taiKhoanMoi = new TaiKhoan();
        
        String nextId = generateNextId();
        taiKhoanMoi.setIdTaiKhoan(nextId);
        
        taiKhoanMoi.setEmail(inputEmail);
        taiKhoanMoi.setTenDangNhap(inputTenDangNhap);
        
        String encodedPassword = passwordEncoder.encode(request.getMatKhau());
        taiKhoanMoi.setMatKhau(encodedPassword);
        
        taiKhoanMoi.setNgayTao(LocalDateTime.now());
        
        // Ưu tiên lấy loaiNguoiDungID từ request, nếu trống thì mới mặc định là "1"
        String roleId = (request.getLoaiNguoiDungID() != null && !request.getLoaiNguoiDungID().trim().isEmpty()) 
                        ? request.getLoaiNguoiDungID().trim() 
                        : "1";
        taiKhoanMoi.setLoaiNguoiDungID(roleId); 
        // -----------------------

        taiKhoanRepository.save(taiKhoanMoi);

        return "Đăng ký thành công với mã số: " + nextId;
    }

    public AuthResponse login(LoginRequest request) {
        String inputTaiKhoan = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(inputTaiKhoan, inputTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản hoặc email: " + inputTaiKhoan));

        boolean isMatch = passwordEncoder.matches(request.getMatKhau().trim(), taiKhoan.getMatKhau().trim());

        if (!isMatch) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), taiKhoan.getLoaiNguoiDungID());
        
        return new AuthResponse(
            token, 
            "Đăng nhập thành công!", 
            taiKhoan.getLoaiNguoiDungID(), 
            ""
        );
    }

    private String generateNextId() {
        String maxId = taiKhoanRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "TK001";
        }
        String cleanId = maxId.trim(); 
        try {
            int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
            return String.format("TK%03d", nextNumber);
        } catch (Exception e) {
            return "TK001"; 
        }
    }
}