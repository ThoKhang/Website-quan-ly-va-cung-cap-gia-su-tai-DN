package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.AuthResponse;
import com.nhom26.tutormanagement.dto.ForgotPasswordRequest;
import com.nhom26.tutormanagement.dto.LoginRequest;
import com.nhom26.tutormanagement.dto.RegisterRequest;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
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
    private final GiaSuRepository giaSuRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;

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
        
        // Ưu tiên lấy loaiNguoiDungID từ request, chỉ cho phép Phụ huynh (1) hoặc Gia sư (2)
        String roleId = (request.getLoaiNguoiDungID() != null && !request.getLoaiNguoiDungID().trim().isEmpty()) 
                        ? request.getLoaiNguoiDungID().trim() 
                        : "1";
        
        // Kiểm tra role hợp lệ (chỉ cho phép 1 và 2)
        if (!roleId.equals("1") && !roleId.equals("2")) {
            throw new RuntimeException("Loại tài khoản không hợp lệ. Chỉ cho phép Phụ huynh hoặc Gia sư.");
        }
        
        taiKhoanMoi.setLoaiNguoiDungID(roleId);
        System.out.println("📝 Đăng ký tài khoản: " + inputTenDangNhap + " với loaiNguoiDungID: " + roleId);

        taiKhoanRepository.save(taiKhoanMoi);

        return "Đăng ký thành công với mã số: " + nextId;
    }

    public AuthResponse login(LoginRequest request) {
        String inputTaiKhoan = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(inputTaiKhoan, inputTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản hoặc email: " + inputTaiKhoan));

        boolean isMatch = passwordEncoder.matches(request.getMatKhau().trim(), taiKhoan.getMatKhau());

        if (!isMatch) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        String roleId = taiKhoan.getLoaiNguoiDungID();
        if (roleId == null || roleId.trim().isEmpty()) {
            System.out.println("⚠️ CẢNH BÁO: loaiNguoiDungID bị NULL cho tài khoản " + inputTaiKhoan + ". Mặc định thành '1'");
            roleId = "1";
        }
        
        System.out.println("✅ Đăng nhập thành công: " + inputTaiKhoan + " với loaiNguoiDungID: " + roleId);
        
        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), roleId);
        
        // Lấy ID của người dùng tương ứng (GiaSu, PhuHuynh, v.v.)
        String idNguoiDung = taiKhoan.getIdTaiKhoan();
        
        // Nếu là Gia sư (loaiNguoiDungID = 2), lấy idGiaSu
        if ("2".equals(roleId)) {
            GiaSu giaSu = giaSuRepository.findByTaiKhoan_IdTaiKhoan(taiKhoan.getIdTaiKhoan())
                    .orElse(null);
            if (giaSu != null) {
                idNguoiDung = giaSu.getIdGiaSu();
            }
        }
        // Nếu là Phụ huynh (loaiNguoiDungID = 1), lấy idPhuHuynh
        else if ("1".equals(roleId)) {
            PhuHuynh phuHuynh = phuHuynhRepository.findByTaiKhoan_TenDangNhap(taiKhoan.getTenDangNhap())
                    .orElse(null);
            if (phuHuynh != null) {
                idNguoiDung = phuHuynh.getIdPhuHuynh();
                System.out.println("✅ Tìm thấy idPhuHuynh: " + idNguoiDung);
            } else {
                System.out.println("⚠️ CẢNH BÁO: Không tìm thấy hồ sơ PhuHuynh cho tài khoản: " + taiKhoan.getTenDangNhap());
            }
        }
        
        return new AuthResponse(
            token, 
            "Đăng nhập thành công!", 
            roleId, 
            idNguoiDung
        );
    }
    public String forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        if (identifier.isEmpty()) {
            throw new RuntimeException("Vui lòng nhập Email hoặc Tên đăng nhập.");
        }

        // Truyền identifier vào cả 2 vế, DB khớp cái nào lấy cái đó!
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản hợp lệ!"));

        emailOtpService.sendForgotPasswordOtp(taiKhoan.getEmail(), taiKhoan.getTenDangNhap());
        return maskEmail(taiKhoan.getEmail());
    }

    public void verifyOtp(String identifier, String otp) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(identifier.trim(), identifier.trim())
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy tài khoản!"));
                
        if (!emailOtpService.isOtpValid(taiKhoan.getEmail(), otp)) {
            throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }

    public void resetPassword(String identifier, String otp, String newPassword) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(identifier.trim(), identifier.trim())
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy tài khoản!"));

        if (!emailOtpService.isOtpValid(taiKhoan.getEmail(), otp)) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);
        emailOtpService.clearOtp(taiKhoan.getEmail());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        String name = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        if (name.length() <= 3) {
            return name.charAt(0) + "***" + domain;
        }
        return name.substring(0, 3) + "***" + domain;
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
