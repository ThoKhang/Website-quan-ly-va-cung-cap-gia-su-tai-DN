package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import lombok.RequiredArgsConstructor;
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

    /**
     * Hàm sinh mã Đăng ký học tiếp theo (DKxxx)
     */
    private String generateNextIdDangKy() {
        String maxId = dangKyHocRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "DK001";
        }
        String cleanId = maxId.trim();
        int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
        return String.format("DK%03d", nextNumber);
    }

    /**
     * Hàm lấy số thứ tự lớn nhất hiện tại của Lịch học (LHxxx)
     */
    private int getCurrentMaxLichHocNumber() {
        String maxId = chiTietLichHocRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return 0;
        }
        return Integer.parseInt(maxId.trim().substring(2));
    }

    @Transactional(rollbackFor = Exception.class)
    public String datLop(BookingRequestDTO request) {
        // 1. Kiểm tra sự tồn tại của các thực thể liên quan
        PhuHuynh phuHuynh = phuHuynhRepository.findById(request.getIdPhuHuynh())
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy thông tin Phụ huynh!"));
        HocVien hocVien = hocVienRepository.findById(request.getIdHocVien())
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy thông tin Học viên!"));
        KhoaHoc khoaHoc = khoaHocRepository.findById(request.getIdKhoaHoc())
                .orElseThrow(() -> new RuntimeException("LỖI: Khóa học không tồn tại!"));

        // 2. Tạo Phiếu Đăng Ký Học với ID trình tự (DKxxx)
        DangKyHoc dangKy = new DangKyHoc();
        String idDangKyMoi = generateNextIdDangKy();
        
        dangKy.setIdDangKy(idDangKyMoi);
        dangKy.setPhuHuynh(phuHuynh);
        dangKy.setHocVien(hocVien);
        dangKy.setKhoaHoc(khoaHoc);
        dangKy.setNgayDangKy(LocalDateTime.now());
        dangKy.setLoaiDangKy("Booking Trực Tiếp");
        dangKy.setTrangThaiThanhToan(false);
        dangKy.setTrangThaiHoanThanh(false);
        
        dangKyHocRepository.save(dangKy);

        // 3. Xử lý Chi tiết lịch học (LHxxx) và Lịch dạy gia sư
        // Lấy số thứ tự lớn nhất hiện tại trước khi vào vòng lặp
        int currentLHNumber = getCurrentMaxLichHocNumber();

        for (String idLichDay : request.getDanhSachIdLichDay()) {
            LichDay lichDay = lichDayRepository.findById(idLichDay)
                    .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy ca học của gia sư!"));

            // Kiểm tra trạng thái trống của ca học
            if (lichDay.getTinhTrang() == null || !lichDay.getTinhTrang()) {
                throw new RuntimeException("Ca học này đã có người đặt trước đó!");
            }

            // Đổi trạng thái lịch dạy sang "Đã đặt" (false)
            lichDay.setTinhTrang(false);
            lichDayRepository.save(lichDay);

            // Tăng số thứ tự ID Lịch học cho từng tiết
            currentLHNumber++;
            String idLichHocMoi = String.format("LH%03d", currentLHNumber);

            // Tạo Chi tiết lịch học
            ChiTietLichHoc chiTiet = new ChiTietLichHoc();
            chiTiet.setIdLichHoc(idLichHocMoi);
            chiTiet.setDangKyHoc(dangKy);
            chiTiet.setLichDay(lichDay);
            chiTiet.setTinhTrang("Chưa bắt đầu");
            chiTiet.setNgayHoc(LocalDateTime.now()); // Có thể điều chỉnh theo logic nghiệp vụ cụ thể
            
            chiTietLichHocRepository.save(chiTiet);
        }

        return "Đặt lớp thành công! Mã đơn: " + idDangKyMoi;
    }
}