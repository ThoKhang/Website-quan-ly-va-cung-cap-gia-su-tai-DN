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
        // --- BẢO MẬT JWT: Lấy thông tin chính chủ từ Token ---
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        PhuHuynh phuHuynhThucTe = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy hồ sơ Phụ huynh hợp lệ!"));

        // 1. Kiểm tra sự tồn tại của Học viên và Khóa học
        HocVien hocVien = hocVienRepository.findById(request.getIdHocVien())
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy thông tin Học viên!"));
        
        KhoaHoc khoaHoc = khoaHocRepository.findById(request.getIdKhoaHoc())
                .orElseThrow(() -> new RuntimeException("LỖI: Khóa học không tồn tại!"));

        // Lưu lại ID của Gia sư chủ quản Khóa học này để kiểm tra ở vòng lặp
        String idGiaSuCuaKhoaHoc = khoaHoc.getGiaSu().getIdGiaSu();

        // 2. Tạo đơn đăng ký
        DangKyHoc dangKy = new DangKyHoc();
        String idDangKyMoi = generateNextIdDangKy();
        dangKy.setIdDangKy(idDangKyMoi);
        
        // Gán Phụ huynh trực tiếp từ JWT
        dangKy.setPhuHuynh(phuHuynhThucTe);
        dangKy.setHocVien(hocVien);
        dangKy.setKhoaHoc(khoaHoc);
        
        // Thời điểm đăng ký là ngay lúc này
        dangKy.setNgayDangKy(LocalDateTime.now());
        dangKy.setNgayBatDauHoc(request.getNgayBatDauHoc());
        dangKy.setLoaiDangKy("Booking Trực Tiếp");
        dangKy.setTrangThaiThanhToan(false);
        dangKy.setTrangThaiHoanThanh(false);
        dangKyHocRepository.save(dangKy);

        // 3. Xử lý lịch học
        if (request.getDanhSachIdLichDay() == null || request.getDanhSachIdLichDay().isEmpty()) {
            throw new RuntimeException("LỖI: Vui lòng chọn ít nhất 1 buổi học!");
        }

        int currentLHNumber = getCurrentMaxLichHocNumber();
        for (String idLichDay : request.getDanhSachIdLichDay()) {
            LichDay lichDay = lichDayRepository.findById(idLichDay)
                    .orElseThrow(() -> new RuntimeException("LỖI: Ca học " + idLichDay + " không tồn tại!"));

            // ======================================================
            // CHỐT CHẶN LOGIC: NGĂN CHẶN GHÉP LỊCH CHÉO GIA SƯ
            // ======================================================
            if (!lichDay.getGiaSu().getIdGiaSu().equals(idGiaSuCuaKhoaHoc)) {
                throw new RuntimeException("LỖI LOGIC: Ca học " + idLichDay + " thuộc về Gia sư khác. Bạn không thể ghép lịch này vào khóa học hiện tại!");
            }

            if (lichDay.getTinhTrang() == null || !lichDay.getTinhTrang()) {
                throw new RuntimeException("LỖI: Ca học " + idLichDay + " đã bị đặt hoặc không khả dụng!");
            }

            // Cập nhật trạng thái ca học thành Đã đặt (false)
            lichDay.setTinhTrang(false);
            lichDayRepository.save(lichDay);

            currentLHNumber++;
            ChiTietLichHoc chiTiet = new ChiTietLichHoc();
            chiTiet.setIdLichHoc(String.format("LH%03d", currentLHNumber));
            chiTiet.setDangKyHoc(dangKy);
            chiTiet.setLichDay(lichDay);
            chiTiet.setTinhTrang("Chưa bắt đầu");
            // Ghi chú: Chỗ setNgayHoc này mình giữ nguyên theo logic cũ của bạn.
            chiTiet.setNgayHoc(LocalDateTime.now()); 
            chiTietLichHocRepository.save(chiTiet);
        }

        return "Đặt lớp thành công! Mã đơn: " + idDangKyMoi;
    }
}