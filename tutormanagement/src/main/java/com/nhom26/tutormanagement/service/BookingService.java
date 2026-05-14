package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BookingRequestDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

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

    // HÀM HỖ TRỢ: Chuyển đổi chuỗi "Thứ 2", "Chủ nhật"... thành số nguyên 1 -> 7 (DayOfWeek của Java)
    private int convertThuToDayOfWeek(String thuStr) {
        if (thuStr == null) return -1;
        
        String t = thuStr.toLowerCase().trim();
        if (t.contains("2")) return 1; // Monday trong Java là 1
        if (t.contains("3")) return 2;
        if (t.contains("4")) return 3;
        if (t.contains("5")) return 4;
        if (t.contains("6")) return 5;
        if (t.contains("7")) return 6;
        if (t.contains("chủ nhật") || t.contains("cn")) return 7; // Sunday trong Java là 7
        
        return -1; // Không hợp lệ
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

        // ======================================================
        // [CHỐT CHẶN BẢO VỆ 1]: KHÓA HỌC PHẢI ĐƯỢC ADMIN DUYỆT (tinhTrang = 1)
        // ======================================================
        if (khoaHoc.getTinhTrang() == null || khoaHoc.getTinhTrang() != 1) {
            throw new RuntimeException("LỖI BẢO MẬT: Khóa học này chưa được Admin phê duyệt hoặc đang bị khóa, bạn không thể đăng ký!");
        }

        if (khoaHoc.getSoBuoiHoc() == null || khoaHoc.getSoBuoiHoc() <= 0) {
            throw new RuntimeException("LỖI: Khóa học này chưa được thiết lập số buổi học (soBuoiHoc) hợp lệ!");
        }

        // Lưu lại ID của Gia sư chủ quản Khóa học này để kiểm tra ở vòng lặp
        String idGiaSuCuaKhoaHoc = khoaHoc.getGiaSu().getIdGiaSu();

        // Ép kiểu request.getNgayBatDauHoc() (đang là LocalDate) ra một biến riêng cho dễ xử lý
        LocalDate ngayBatDau = request.getNgayBatDauHoc();

        // 2. Tạo đơn đăng ký
        DangKyHoc dangKy = new DangKyHoc();
        String idDangKyMoi = generateNextIdDangKy();
        dangKy.setIdDangKy(idDangKyMoi);
        dangKy.setPhuHuynh(phuHuynhThucTe);
        dangKy.setHocVien(hocVien);
        dangKy.setKhoaHoc(khoaHoc);
        dangKy.setNgayDangKy(LocalDateTime.now());
        
        dangKy.setNgayBatDauHoc(ngayBatDau);
        
        dangKy.setLoaiDangKy("Booking Trực Tiếp");
        dangKy.setTrangThaiThanhToan(true); // ✅ Đã thanh toán (người dùng đã quét QR hoặc chuyển khoản)
        dangKy.setTrangThaiHoanThanh(false);
        dangKyHocRepository.save(dangKy);

        // 3. Tiền xử lý các ca học được chọn
        if (request.getDanhSachIdLichDay() == null || request.getDanhSachIdLichDay().isEmpty()) {
            throw new RuntimeException("LỖI: Vui lòng chọn ít nhất 1 buổi học!");
        }

        Map<Integer, LichDay> thuToLichDayMap = new HashMap<>();

        for (String idLichDay : request.getDanhSachIdLichDay()) {
            LichDay lichDay = lichDayRepository.findById(idLichDay)
                    .orElseThrow(() -> new RuntimeException("LỖI: Ca học " + idLichDay + " không tồn tại!"));

            // [CHỐT CHẶN BẢO VỆ 2]: NGĂN CHẶN GHÉP LỊCH CHÉO GIA SƯ
            if (!lichDay.getGiaSu().getIdGiaSu().equals(idGiaSuCuaKhoaHoc)) {
                throw new RuntimeException("LỖI LOGIC: Ca học " + idLichDay + " thuộc về Gia sư khác. Bạn không thể ghép lịch này vào khóa học hiện tại!");
            }

            if (lichDay.getTinhTrang() == null || !lichDay.getTinhTrang()) {
                throw new RuntimeException("LỖI: Ca học " + idLichDay + " đã bị đặt hoặc không khả dụng!");
            }

            // Đổi trạng thái lịch dạy thành false (Đã có người đặt)
            lichDay.setTinhTrang(false);
            lichDayRepository.save(lichDay);

            // Phiên dịch chuỗi "Thứ" thành số và đưa vào Map
            int thuConverted = convertThuToDayOfWeek(lichDay.getTietHoc().getThu());
            if (thuConverted != -1) {
                thuToLichDayMap.put(thuConverted, lichDay);
            } else {
                throw new RuntimeException("LỖI DỮ LIỆU: Cột 'thu' trong Tiết học không hợp lệ (" + lichDay.getTietHoc().getThu() + ")!");
            }
        }

        // 4. Rải lịch học tự động
        int soBuoiToiDa = khoaHoc.getSoBuoiHoc();
        int soBuoiDaTao = 0;
        int currentLHNumber = getCurrentMaxLichHocNumber();
        
        // Khởi tạo ngày chạy bằng LocalDate
        LocalDate ngayChay = ngayBatDau;

        while (soBuoiDaTao < soBuoiToiDa) {
            // Java trả về thứ 2 = 1, thứ 3 = 2, CN = 7
            int currentThu = ngayChay.getDayOfWeek().getValue();

            if (thuToLichDayMap.containsKey(currentThu)) {
                LichDay lichDayHomNay = thuToLichDayMap.get(currentThu);

                currentLHNumber++;
                ChiTietLichHoc chiTiet = new ChiTietLichHoc();
                chiTiet.setIdLichHoc(String.format("LH%03d", currentLHNumber));
                chiTiet.setDangKyHoc(dangKy);
                chiTiet.setLichDay(lichDayHomNay);
                chiTiet.setTinhTrang("Chưa bắt đầu");
                
                // TUYỆT ĐỈNH: Ghép Ngày (LocalDate) + Giờ (LocalTime lấy từ TietHoc) -> LocalDateTime
                LocalTime gioBatDauTietHoc = lichDayHomNay.getTietHoc().getGioBatDau().toLocalTime();
                LocalDateTime thoiGianHocChinhXac = LocalDateTime.of(ngayChay, gioBatDauTietHoc);
                
                chiTiet.setNgayHoc(thoiGianHocChinhXac); 
                
                chiTietLichHocRepository.save(chiTiet);
                soBuoiDaTao++;
            }
            // Tịnh tiến lên 1 ngày để kiểm tra tiếp
            ngayChay = ngayChay.plusDays(1);
        }

        return "Đặt lớp thành công! Đã tự động tạo lịch cho " + soBuoiToiDa + " buổi học. Mã đơn: " + idDangKyMoi;
    }
}