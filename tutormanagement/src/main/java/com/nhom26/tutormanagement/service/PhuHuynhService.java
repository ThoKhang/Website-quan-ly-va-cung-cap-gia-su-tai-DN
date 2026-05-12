package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.entity.PhuongXa;
import com.nhom26.tutormanagement.dto.PhuHuynhUpdateDTO;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.repository.PhuongXaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhuHuynhService {
    private final PhuHuynhRepository phuHuynhRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final PhuongXaRepository phuongXaRepository;

    private String generateNextId() {
        // Use UUID to avoid concurrent duplicate key errors
        return "PH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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

    @Transactional
    public PhuHuynh layThongTinHienTai() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<PhuHuynh> phuHuynh = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername);
        
        if (phuHuynh.isEmpty()) {
            // Nếu chưa có hồ sơ phụ huynh, tạo hồ sơ trống
            TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                    .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản người dùng!"));
            
            // Kiểm tra lại xem có hồ sơ nào được tạo bởi tài khoản này không (race condition)
            Optional<PhuHuynh> existingCheck = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername);
            if (existingCheck.isPresent()) {
                return existingCheck.get();
            }
            
            PhuHuynh phuHuynhMoi = new PhuHuynh();
            phuHuynhMoi.setIdPhuHuynh(generateNextId());
            phuHuynhMoi.setTaiKhoan(taiKhoan);
            return phuHuynhRepository.save(phuHuynhMoi);
        }
        
        return phuHuynh.get();
    }

    @Transactional
    public PhuHuynh capNhatThongTin(PhuHuynhUpdateDTO phuHuynhUpdate) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        PhuHuynh phuHuynhHienTai = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy hồ sơ Phụ huynh!"));

        // Cập nhật các trường được phép
        if (phuHuynhUpdate.getTenPhuHuynh() != null && !phuHuynhUpdate.getTenPhuHuynh().isEmpty()) {
            phuHuynhHienTai.setTenPhuHuynh(phuHuynhUpdate.getTenPhuHuynh());
        }
        if (phuHuynhUpdate.getGioiTinh() != null) {
            phuHuynhHienTai.setGioiTinh(phuHuynhUpdate.getGioiTinh());
        }
        if (phuHuynhUpdate.getNgaySinh() != null) {
            phuHuynhHienTai.setNgaySinh(phuHuynhUpdate.getNgaySinh());
        }
        if (phuHuynhUpdate.getSdt() != null && !phuHuynhUpdate.getSdt().isEmpty()) {
            phuHuynhHienTai.setSdt(phuHuynhUpdate.getSdt());
        }
        if (phuHuynhUpdate.getCccd() != null && !phuHuynhUpdate.getCccd().isEmpty()) {
            phuHuynhHienTai.setCccd(phuHuynhUpdate.getCccd());
        }
        if (phuHuynhUpdate.getSoNhaTenDuong() != null && !phuHuynhUpdate.getSoNhaTenDuong().isEmpty()) {
            phuHuynhHienTai.setSoNhaTenDuong(phuHuynhUpdate.getSoNhaTenDuong());
        }
        
        // Cập nhật Phường/Xã nếu có
        if (phuHuynhUpdate.getMaPhuongXa() != null && !phuHuynhUpdate.getMaPhuongXa().isEmpty()) {
            PhuongXa phuongXa = phuongXaRepository.findById(phuHuynhUpdate.getMaPhuongXa())
                    .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy Phường/Xã!"));
            phuHuynhHienTai.setPhuongXa(phuongXa);
        }

        return phuHuynhRepository.save(phuHuynhHienTai);
    }
}