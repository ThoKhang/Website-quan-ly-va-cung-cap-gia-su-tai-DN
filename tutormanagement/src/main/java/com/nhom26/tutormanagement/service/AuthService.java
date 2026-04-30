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

    /**
     * Chức năng Đăng ký tài khoản mới
     * Mật khẩu sẽ được băm (hash) trước khi lưu vào Database
     */
    public String register(RegisterRequest request) {
        // 1. Làm sạch dữ liệu đầu vào
        String inputTenDangNhap = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        // 2. Kiểm tra trùng lặp
        if (taiKhoanRepository.findByTenDangNhapOrEmail(inputTenDangNhap, inputEmail).isPresent()) {
            throw new RuntimeException("Tên đăng nhập hoặc Email này đã tồn tại trong hệ thống!");
        }

        // 3. Khởi tạo thực thể tài khoản mới
        TaiKhoan taiKhoanMoi = new TaiKhoan();
        taiKhoanMoi.setIdTaiKhoan(IdGeneratorUtil.generateId());
        taiKhoanMoi.setEmail(inputEmail);
        taiKhoanMoi.setTenDangNhap(inputTenDangNhap);
        
        // BĂM MẬT KHẨU: Chuyển '123456' thành dãy ký tự bảo mật (ví dụ: $2a$10$...)
        String encodedPassword = passwordEncoder.encode(request.getMatKhau());
        taiKhoanMoi.setMatKhau(encodedPassword);
        
        taiKhoanMoi.setNgayTao(LocalDateTime.now());
        
        // Gán quyền mặc định là "Người dùng" (ID = 1)
        taiKhoanMoi.setLoaiNguoiDungID("1"); 

        // 4. Lưu xuống Database
        taiKhoanRepository.save(taiKhoanMoi);

        return "Đăng ký tài khoản thành công!";
    }

    /**
     * Chức năng Đăng nhập
     * Hỗ trợ tìm kiếm theo cả Tên đăng nhập hoặc Email
     */
    public AuthResponse login(LoginRequest request) {
        String inputTaiKhoan = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";

        System.out.println("========== BẮT ĐẦU KIỂM TRA ĐĂNG NHẬP ==========");

        // Bước 1: Tìm tài khoản trong DB (Username hoặc Email)
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapOrEmail(inputTaiKhoan, inputTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản hoặc email: " + inputTaiKhoan));

        // Bước 2: Kiểm tra mật khẩu bằng BCrypt
        // Hàm matches sẽ tự động băm mật khẩu người dùng nhập vào để so sánh với mã băm trong DB
        boolean isMatch = passwordEncoder.matches(request.getMatKhau().trim(), taiKhoan.getMatKhau().trim());

        if (!isMatch) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        System.out.println("KẾT QUẢ: Xác thực thành công cho người dùng: " + taiKhoan.getTenDangNhap());
        System.out.println("================================================");

        // Bước 3: Tạo JWT Token
        String token = jwtService.generateToken(taiKhoan.getTenDangNhap(), taiKhoan.getLoaiNguoiDungID());
        
        // ID người dùng nghiệp vụ (Gia sư/Phụ huynh) sẽ được truy vấn bổ sung sau khi hoàn thiện Profile
        String idNguoiDung = ""; 
        
        return new AuthResponse(
            token, 
            "Đăng nhập thành công!", 
            taiKhoan.getLoaiNguoiDungID(), 
            idNguoiDung
        );
    }
}