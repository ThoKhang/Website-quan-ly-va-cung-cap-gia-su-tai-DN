package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import com.nhom26.tutormanagement.util.IdGeneratorUtil;
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

    @Transactional(rollbackFor = Exception.class) // Nếu có lỗi bất kỳ, hủy bỏ toàn bộ thao tác
    public String datLop(BookingRequestDTO request) {
        // 1. Kiểm tra sự tồn tại của Phụ huynh, Học viên và Khóa học
        PhuHuynh phuHuynh = phuHuynhRepository.findById(request.getIdPhuHuynh())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin Phụ huynh!"));
        HocVien hocVien = hocVienRepository.findById(request.getIdHocVien())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin Học viên!"));
        KhoaHoc khoaHoc = khoaHocRepository.findById(request.getIdKhoaHoc())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        // 2. Tạo Phiếu Đăng Ký Học
        DangKyHoc dangKy = new DangKyHoc();
        dangKy.setIdDangKy(IdGeneratorUtil.generateId());
        dangKy.setPhuHuynh(phuHuynh);
        dangKy.setHocVien(hocVien);
        dangKy.setKhoaHoc(khoaHoc);
        dangKy.setNgayDangKy(LocalDateTime.now());
        dangKy.setLoaiDangKy("Booking Trực Tiếp");
        dangKy.setTrangThaiThanhToan(false); // Chưa thanh toán
        dangKy.setTrangThaiHoanThanh(false); // Chưa học xong
        
        // Lưu phiếu đăng ký
        dangKyHocRepository.save(dangKy);

        // 3. Xử lý "Nhặt lịch" (Lưu chi tiết các ca học và đổi trạng thái lịch gia sư)
        for (String idLichDay : request.getDanhSachIdLichDay()) {
            LichDay lichDay = lichDayRepository.findById(idLichDay)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ca học của gia sư!"));

            // Kiểm tra xem ca này có người khác vừa đặt mất không (Race condition cơ bản)
            if (!lichDay.getTinhTrang()) {
                throw new RuntimeException("Ca học " + lichDay.getTietHoc().getThu() + " đã có người đặt, vui lòng chọn ca khác!");
            }

            // Đổi trạng thái từ Trống (true) -> Đã đặt (false)
            lichDay.setTinhTrang(false);
            lichDayRepository.save(lichDay);

            // Tạo Chi tiết lịch học
            ChiTietLichHoc chiTiet = new ChiTietLichHoc();
            chiTiet.setIdLichHoc(IdGeneratorUtil.generateId());
            chiTiet.setDangKyHoc(dangKy);
            chiTiet.setLichDay(lichDay);
            chiTiet.setTinhTrang("Chưa bắt đầu"); 
            
            // Lưu chi tiết lịch
            chiTietLichHocRepository.save(chiTiet);
        }

        return "Đặt lớp thành công! Mã đơn của bạn là: " + dangKy.getIdDangKy();
    }
}