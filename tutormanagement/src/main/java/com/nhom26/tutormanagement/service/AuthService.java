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
        
        // Ưu tiên lấy loaiNguoiDungID từ request, nếu trống thì mới mặc định là "1"
        String roleId = (request.getLoaiNguoiDungID() != null && !request.getLoaiNguoiDungID().trim().isEmpty()) 
                        ? request.getLoaiNguoiDungID().trim() 
                        : "1";
        taiKhoanMoi.setLoaiNguoiDungID(roleId);
        System.out.println("📝 Đăng ký tài khoản: " + inputTenDangNhap + " với loaiNguoiDungID: " + roleId);
        // -----------------------

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
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";
        if (inputEmail.isEmpty()) {
            throw new RuntimeException("Vui lòng nhập email.");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(inputEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email: " + inputEmail));

        emailOtpService.sendForgotPasswordOtp(taiKhoan.getEmail(), taiKhoan.getTenDangNhap());
        return "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.";
    }
    // Hàm 1: Kiểm tra OTP có đúng không
    public void verifyOtp(String email, String otp) {
        if (!emailOtpService.isOtpValid(email, otp)) {
            throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }

    // Hàm 2: Đặt lại mật khẩu mới
    public void resetPassword(String email, String otp, String newPassword) {
        // Kiểm tra OTP lại lần cuối (đề phòng ai đó gọi thẳng API bypass bước 1)
        if (!emailOtpService.isOtpValid(email, otp)) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        // Tìm tài khoản và đổi pass
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        taiKhoan.setMatKhau(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);

        // Đổi thành công thì xóa luôn OTP trong RAM
        emailOtpService.clearOtp(email);
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
