package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.DanhGiaRequestDTO;
import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.DanhGia;
import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.DanhGiaRepository;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final DangKyHocRepository dangKyHocRepository;
    private final PhuHuynhRepository phuHuynhRepository;

    private String generateNextIdDanhGia() {
        String maxId = danhGiaRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "DG001";
        try {
            int nextNumber = Integer.parseInt(maxId.trim().substring(2)) + 1;
            return String.format("DG%03d", nextNumber);
        } catch (Exception e) {
            return "DG001";
        }
    }

    @Transactional
    public String taoDanhGia(DanhGiaRequestDTO request) {
        // 1. Lấy thông tin Phụ huynh đang đăng nhập
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        PhuHuynh phuHuynh = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy hồ sơ Phụ huynh!"));

        // 2. Tìm Đơn đăng ký học
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(request.getIdDangKy())
                .orElseThrow(() -> new RuntimeException("LỖI: Đơn đăng ký học không tồn tại!"));

        // 3. CHỐT CHẶN LOGIC 1: Đơn này có phải của Phụ huynh đang đăng nhập không?
        if (!dangKyHoc.getPhuHuynh().getIdPhuHuynh().equals(phuHuynh.getIdPhuHuynh())) {
            throw new RuntimeException("LỖI: Bạn không có quyền đánh giá lớp học của người khác!");
        }

        // 4. CHỐT CHẶN LOGIC 2: Đơn đã hoàn thành chưa?
        // (Kiểm tra theo kiểu boolean, nếu DB của bạn dùng int thì đổi thành == 1)
        if (dangKyHoc.getTrangThaiHoanThanh() == null || !dangKyHoc.getTrangThaiHoanThanh()) {
            throw new RuntimeException("LỖI: Bạn chỉ được phép đánh giá khi khóa học đã hoàn thành!");
        }

        // 5. CHỐT CHẶN LOGIC 3: Đã đánh giá chưa?
        if (danhGiaRepository.existsByDangKyHoc_IdDangKy(request.getIdDangKy())) {
            throw new RuntimeException("LỖI: Bạn đã đánh giá cho lớp học này rồi, không thể đánh giá lại!");
        }

        // Kiểm tra số sao hợp lệ
        if (request.getSoSao() == null || request.getSoSao() < 1 || request.getSoSao() > 5) {
            throw new RuntimeException("LỖI: Số sao đánh giá phải từ 1 đến 5!");
        }

        // 6. Lưu Đánh giá
        DanhGia danhGiaMoi = new DanhGia();
        danhGiaMoi.setIdDanhGia(generateNextIdDanhGia());
        danhGiaMoi.setDangKyHoc(dangKyHoc);
        danhGiaMoi.setSoSao(request.getSoSao());
        danhGiaMoi.setNoiDung(request.getNoiDung());
        danhGiaMoi.setNgayDanhGia(LocalDateTime.now());

        danhGiaRepository.save(danhGiaMoi);

        return "Cảm ơn bạn đã gửi đánh giá thành công!";
    }

    public DanhGia getDanhGiaByDangKy(String idDangKy) {
        return danhGiaRepository.findByDangKyHoc_IdDangKy(idDangKy)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy đánh giá cho đơn đăng ký này!"));
    }
}