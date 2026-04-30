package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ThongKeDoanhThuDTO;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.LichSuThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ThongKeService {

    private final LichSuThanhToanRepository lichSuThanhToanRepository;
    private final DangKyHocRepository dangKyHocRepository;

    /**
     * Chức năng Điểm nhấn 3: Thống kê doanh thu theo tháng/năm
     */
    public ThongKeDoanhThuDTO layBaoCaoDoanhThuThang(int thang, int nam) {
        // Xác định khoảng thời gian của tháng đó
        LocalDateTime startDate = LocalDateTime.of(nam, thang, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);

        // 1. Tính tổng doanh thu từ bảng LichSuThanhToan (Gọi hàm đã viết ở Repository)
        BigDecimal tongDoanhThu = lichSuThanhToanRepository.sumDoanhThuTrongKhoangThoiGian(startDate, endDate);
        if (tongDoanhThu == null) {
            tongDoanhThu = BigDecimal.ZERO;
        }

        // 2. Đếm số lượng lớp mới được đăng ký trong tháng đó
        // Bạn có thể viết thêm hàm countByNgayDangKyBetween trong DangKyHocRepository
        // Ở đây mình ví dụ logic đếm tổng (thực tế gọi repo sẽ chuẩn hơn):
        long soLopMoi = dangKyHocRepository.findAll().stream()
                .filter(dk -> dk.getNgayDangKy().isAfter(startDate) && dk.getNgayDangKy().isBefore(endDate))
                .count();

        // 3. Đóng gói vào DTO trả ra cho Frontend
        String thangNam = (thang < 10 ? "0" + thang : thang) + "/" + nam;
        return new ThongKeDoanhThuDTO(thangNam, soLopMoi, tongDoanhThu);
    }
}