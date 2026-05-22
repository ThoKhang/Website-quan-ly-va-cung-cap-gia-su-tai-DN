package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.LichSuThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LichSuThanhToanService {

    private final LichSuThanhToanRepository lichSuThanhToanRepository;
    private final DangKyHocRepository dangKyHocRepository;

    private String generateNextId() {
        String maxId = lichSuThanhToanRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "TT001";
        }
        int nextNumber = Integer.parseInt(maxId.trim().substring(2)) + 1;
        return String.format("TT%03d", nextNumber);
    }

    @Transactional
    public LichSuThanhToan luuThanhToan(String idDangKy, BigDecimal soTien,
                                         String phuongThuc, String maGiaoDich) {
        // 1. Tìm đăng ký học
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký: " + idDangKy));

        // 2. Tạo bản ghi thanh toán
        LichSuThanhToan lichSu = new LichSuThanhToan();
        lichSu.setIdThanhToan(generateNextId());
        lichSu.setSoTien(soTien);
        lichSu.setTrangThai("Đã thanh toán");
        lichSu.setNgayThanhToan(LocalDateTime.now());
        lichSu.setPhuongThucThanhToan(phuongThuc);
        lichSu.setMaGiaoDich(maGiaoDich != null ? maGiaoDich : "MANUAL_" + idDangKy);
        lichSu.setDangKyHoc(dangKyHoc);

        // 3. Cập nhật trạng thái thanh toán trong DangKyHoc
        dangKyHoc.setTrangThaiThanhToan(true);
        dangKyHocRepository.save(dangKyHoc);

        return lichSuThanhToanRepository.save(lichSu);
    }
}