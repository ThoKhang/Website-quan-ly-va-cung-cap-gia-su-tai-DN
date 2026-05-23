package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.HocVien;
import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.repository.HocVienRepository;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HocVienService {
    private final HocVienRepository hocVienRepository;
    private final PhuHuynhRepository phuHuynhRepository;

    private String generateNextId() {
        String maxId = hocVienRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "HV00001";
        }
        // Cắt bỏ chữ "HV" (2 ký tự đầu), lấy phần số cộng thêm 1
        int nextNumber = Integer.parseInt(maxId.trim().substring(2)) + 1;
        return String.format("HV%05d", nextNumber);
    }

    public HocVien save(HocVien hocVien) {
        // 1. Lấy username từ Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm hồ sơ Phụ huynh gắn với tài khoản này
        PhuHuynh phuHuynh = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn cần tạo hồ sơ Phụ huynh trước!"));

        // 3. Gán học viên vào phụ huynh này
        hocVien.setPhuHuynh(phuHuynh);

        if (hocVien.getIdHocVien() == null || hocVien.getIdHocVien().isEmpty()) {
            hocVien.setIdHocVien(generateNextId());
        }
        return hocVienRepository.save(hocVien);
    }

    public List<HocVien> layDanhSachHocVienCuaPhuHuynh() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<PhuHuynh> phuHuynhOpt = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername);
        
        if (phuHuynhOpt.isEmpty()) {
            // Nếu chưa có hồ sơ phụ huynh, trả về danh sách trống
            return new java.util.ArrayList<>();
        }
        
        return hocVienRepository.findByPhuHuynh_IdPhuHuynh(phuHuynhOpt.get().getIdPhuHuynh());
    }
}