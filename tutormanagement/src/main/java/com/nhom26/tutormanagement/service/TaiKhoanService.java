package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ChangePasswordRequestDTO;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;

    public String sendChangePasswordOtp() {
        // 1. Lấy username của người đang đăng nhập từ JWT Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm tài khoản trong DB
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản!"));

        // 3. Gửi OTP đến email
        emailOtpService.sendChangePasswordOtp(taiKhoan.getEmail(), taiKhoan.getTenDangNhap());

        // 4. Trả về email đã che
        return maskEmail(taiKhoan.getEmail());
    }

    public void verifyChangePasswordOtp(String otp) {
        // 1. Lấy username của người đang đăng nhập từ JWT Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm tài khoản trong DB
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản!"));

        // 3. Kiểm tra OTP
        if (!emailOtpService.isOtpValid(taiKhoan.getEmail(), otp)) {
            throw new RuntimeException("LỖI: Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }

    @Transactional
    public String doiMatKhau(ChangePasswordRequestDTO request) {
        // 1. Lấy username của người đang đăng nhập từ JWT Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm tài khoản trong DB
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản!"));

        // 3. Kiểm tra mật khẩu cũ có khớp với mã băm trong DB không
        if (!passwordEncoder.matches(request.getMatKhauCu(), taiKhoan.getMatKhau())) {
            throw new RuntimeException("LỖI: Mật khẩu cũ không chính xác!");
        }

        // 4. Kiểm tra xác nhận mật khẩu
        if (!request.getMatKhauMoi().equals(request.getXacNhanMatKhau())) {
            throw new RuntimeException("LỖI: Mật khẩu xác nhận không trùng khớp!");
        }

        // 5. Kiểm tra OTP
        if (request.getOtp() == null || request.getOtp().isEmpty()) {
            throw new RuntimeException("LỖI: Vui lòng nhập mã OTP!");
        }

        if (!emailOtpService.isOtpValid(taiKhoan.getEmail(), request.getOtp())) {
            throw new RuntimeException("LỖI: Mã OTP không chính xác hoặc đã hết hạn!");
        }

        // 6. Băm mật khẩu mới và lưu lại
        taiKhoan.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(taiKhoan);

        // 7. Xóa OTP sau khi sử dụng
        emailOtpService.clearOtp(taiKhoan.getEmail());

        return "Đổi mật khẩu thành công!";
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

    public TaiKhoan layThongTinTaiKhoanHienTai(String tenDangNhap) {
        return taiKhoanRepository.findByTenDangNhap(tenDangNhap)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
    }

    // ========================================================
    // CÁC HÀM MỚI BỔ SUNG
    // ========================================================

    public void yeuCauDoiEmail(String newEmail) {
        // 1. Kiểm tra xem email mới đã bị đăng ký chưa
        if (taiKhoanRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email này đã được sử dụng bởi tài khoản khác!");
        }

        // 2. Lấy username của người dùng hiện tại
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 3. Tận dụng hàm gửi OTP cũ, nhưng lần này gửi vào newEmail
        // Nếu muốn nội dung email khác đi, bạn có thể copy hàm sendChangePasswordOtp 
        // trong EmailOtpService thành sendChangeEmailOtp nhé!
        emailOtpService.sendChangePasswordOtp(newEmail, currentUsername);
    }

    @Transactional
    public void xacNhanDoiEmail(String newEmail, String otp) {
        // 1. Kiểm tra OTP có hợp lệ với newEmail không
        if (!emailOtpService.isOtpValid(newEmail, otp)) {
            throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn!");
        }

        // 2. Lấy tài khoản người dùng hiện tại
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        // 3. Cập nhật Email và lưu DB
        taiKhoan.setEmail(newEmail);
        taiKhoanRepository.save(taiKhoan);

        // 4. Xóa OTP sau khi hoàn tất
        emailOtpService.clearOtp(newEmail);
    }

    @Transactional
    public void capNhatNganHang(String nganHang, String stk) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        taiKhoan.setNganHang(nganHang);
        
        // Lưu ý: Tùy thuộc vào cách bạn đặt tên thuộc tính STK trong Entity TaiKhoan.java.
        // Có thể là setSTK() hoặc setStk(). Bạn linh hoạt sửa lại cho đúng nhé.
        taiKhoan.setStk(stk); 
        
        taiKhoanRepository.save(taiKhoan);
    }
}