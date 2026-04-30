package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PhuHuynhService {
    private final PhuHuynhRepository phuHuynhRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    private String generateNextId() {
        String maxId = phuHuynhRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "PH001";
        }
        String cleanId = maxId.trim();
        int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
        return String.format("PH%03d", nextNumber);
    }

    @Transactional
    public PhuHuynh save(PhuHuynh phuHuynh) {
        // 1. Lấy tên đăng nhập từ JWT Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. CHỐT CHẶN BẢO MẬT: Kiểm tra xem tài khoản này đã có hồ sơ phụ huynh chưa
        // Bạn cần khai báo hàm findByTaiKhoan_TenDangNhap trong PhuHuynhRepository
        Optional<PhuHuynh> existingProfile = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername);
        
        if (existingProfile.isPresent()) {
            throw new RuntimeException("LỖI: Tài khoản này đã có hồ sơ Phụ huynh. Không thể tạo thêm!");
        }

        // 3. Tìm tài khoản tương ứng trong DB để liên kết
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản người dùng!"));

        // 4. Gán tài khoản này cho hồ sơ phụ huynh
        phuHuynh.setTaiKhoan(taiKhoan);

        // 5. Sinh ID trình tự PHxxx
        if (phuHuynh.getIdPhuHuynh() == null || phuHuynh.getIdPhuHuynh().isEmpty()) {
            phuHuynh.setIdPhuHuynh(generateNextId());
        }

        return phuHuynhRepository.save(phuHuynh);
    }
}