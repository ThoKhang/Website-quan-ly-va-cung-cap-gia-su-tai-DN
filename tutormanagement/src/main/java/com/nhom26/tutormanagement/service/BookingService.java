package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final DangKyHocRepository dangKyHocRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    private final LichDayRepository lichDayRepository;
    private final PhuHuynhRepository phuHuynhRepository;
    private final HocVienRepository hocVienRepository;
    private final KhoaHocRepository khoaHocRepository;

    private String generateNextIdDangKy() {
        String maxId = dangKyHocRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "DK001";
        return String.format("DK%03d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }

    private int getCurrentMaxLichHocNumber() {
        String maxId = chiTietLichHocRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return 0;
        return Integer.parseInt(maxId.trim().substring(2));
    }

    @Transactional(rollbackFor = Exception.class)
    public String datLop(BookingRequestDTO request) {
        // --- BẢO MẬT JWT: Kiểm tra chính chủ ---
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        PhuHuynh phuHuynhThucTe = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy hồ sơ Phụ huynh hợp lệ!"));

        // So khớp ID gửi lên với ID thật của User (Chống ID Spoofing)
        if (!phuHuynhThucTe.getIdPhuHuynh().trim().equals(request.getIdPhuHuynh().trim())) {
            throw new RuntimeException("CẢNH BÁO: Bạn không có quyền đặt lớp cho hồ sơ người khác!");
        }

        // 1. Kiểm tra sự tồn tại của Học viên và Khóa học
        HocVien hocVien = hocVienRepository.findById(request.getIdHocVien())
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy thông tin Học viên!"));
        KhoaHoc khoaHoc = khoaHocRepository.findById(request.getIdKhoaHoc())
                .orElseThrow(() -> new RuntimeException("LỖI: Khóa học không tồn tại!"));

        // 2. Tạo đơn đăng ký
        DangKyHoc dangKy = new DangKyHoc();
        String idDangKyMoi = generateNextIdDangKy();
        dangKy.setIdDangKy(idDangKyMoi);
        dangKy.setPhuHuynh(phuHuynhThucTe);
        dangKy.setHocVien(hocVien);
        dangKy.setKhoaHoc(khoaHoc);
        dangKy.setNgayDangKy(LocalDateTime.now());
        dangKy.setLoaiDangKy("Booking Trực Tiếp");
        dangKy.setTrangThaiThanhToan(false);
        dangKy.setTrangThaiHoanThanh(false);
        dangKyHocRepository.save(dangKy);

        // 3. Xử lý lịch học
        int currentLHNumber = getCurrentMaxLichHocNumber();
        for (String idLichDay : request.getDanhSachIdLichDay()) {
            LichDay lichDay = lichDayRepository.findById(idLichDay)
                    .orElseThrow(() -> new RuntimeException("LỖI: Ca học không tồn tại!"));

            if (lichDay.getTinhTrang() == null || !lichDay.getTinhTrang()) {
                throw new RuntimeException("Ca học " + idLichDay + " đã bị đặt!");
            }

            lichDay.setTinhTrang(false);
            lichDayRepository.save(lichDay);

            currentLHNumber++;
            ChiTietLichHoc chiTiet = new ChiTietLichHoc();
            chiTiet.setIdLichHoc(String.format("LH%03d", currentLHNumber));
            chiTiet.setDangKyHoc(dangKy);
            chiTiet.setLichDay(lichDay);
            chiTiet.setTinhTrang("Chưa bắt đầu");
            chiTiet.setNgayHoc(LocalDateTime.now());
            chiTietLichHocRepository.save(chiTiet);
        }

        return "Đặt lớp thành công! Mã đơn: " + idDangKyMoi;
    }
}