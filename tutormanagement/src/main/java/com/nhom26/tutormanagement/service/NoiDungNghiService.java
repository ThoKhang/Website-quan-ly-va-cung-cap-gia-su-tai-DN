package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.NoiDungNghi;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.NoiDungNghiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NoiDungNghiService {

    private final NoiDungNghiRepository noiDungNghiRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;

    private String generateNextIdNoiDung() {
        String maxId = noiDungNghiRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "NDN001";
        return String.format("NDN%03d", Integer.parseInt(maxId.trim().substring(3)) + 1);
    }

    @Transactional(rollbackFor = Exception.class)
    public String xinNghiHoc(String idLichHoc, String lyDoNghi) {
        
        ChiTietLichHoc chiTiet = chiTietLichHocRepository.findById(idLichHoc)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy chi tiết lịch học này!"));

        if ("Đã nghỉ".equalsIgnoreCase(chiTiet.getTinhTrang())) {
            throw new RuntimeException("LỖI: Buổi học này đã được báo nghỉ từ trước!");
        }

        LocalDateTime thoiGianHienTai = LocalDateTime.now();
        LocalDateTime thoiGianHoc = chiTiet.getNgayHoc();

        // 1. RÀNG BUỘC THỜI GIAN: Phải báo trước ít nhất 12 tiếng
        if (thoiGianHienTai.plusHours(12).isAfter(thoiGianHoc)) {
            throw new RuntimeException("LỖI: Bạn phải gửi yêu cầu xin nghỉ trước giờ học ít nhất 12 tiếng!");
        }

        // 2. RÀNG BUỘC SỐ BUỔI: Không được nghỉ quá 3 buổi / 1 khóa học
        String idDangKy = chiTiet.getDangKyHoc().getIdDangKy();
        long soBuoiDaNghi = chiTietLichHocRepository.countByDangKyHoc_IdDangKyAndTinhTrang(idDangKy, "Đã nghỉ");

        if (soBuoiDaNghi >= 3) {
            throw new RuntimeException("LỖI: Bạn đã nghỉ " + soBuoiDaNghi + " buổi trong khóa học này. Hệ thống không cho phép nghỉ thêm!");
        }

        // 3. LƯU LÝ DO NGHỈ VÀO BẢNG NoiDungNghi
        NoiDungNghi noiDungNghi = new NoiDungNghi();
        noiDungNghi.setIdNoiDung(generateNextIdNoiDung());
        noiDungNghi.setLyDoNghi(lyDoNghi);
        noiDungNghi.setThoiGianGui(thoiGianHienTai);
        noiDungNghi.setChiTietLichHoc(chiTiet);

        noiDungNghiRepository.save(noiDungNghi);

        // 4. CẬP NHẬT TRẠNG THÁI BẢNG ChiTietLichHoc
        chiTiet.setTinhTrang("Đã nghỉ");
        chiTietLichHocRepository.save(chiTiet);

        return "Yêu cầu xin nghỉ học đã được ghi nhận thành công!";
    }
}