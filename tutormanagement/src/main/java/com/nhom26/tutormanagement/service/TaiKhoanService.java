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

        // 5. Băm mật khẩu mới và lưu lại
        taiKhoan.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(taiKhoan);

        return "Đổi mật khẩu thành công!";
    }
}