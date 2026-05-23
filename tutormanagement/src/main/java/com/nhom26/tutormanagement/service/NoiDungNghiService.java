package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.NoiDungNghi;
import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.NoiDungNghiRepository;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NoiDungNghiService {

    private final NoiDungNghiRepository noiDungNghiRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    
    // BẮT BUỘC: Thêm PhuHuynhRepository để kiểm tra chủ sở hữu
    private final PhuHuynhRepository phuHuynhRepository;

    private String generateNextIdNoiDung() {
        String maxId = noiDungNghiRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "NDN00001";
        return String.format("NDN%05d", Integer.parseInt(maxId.trim().substring(3)) + 1);
    }

    @Transactional(rollbackFor = Exception.class)
    public String xinNghiHoc(String idLichHoc, String lyDoNghi) {
        
        // 1. Lấy thông tin Phụ huynh đang thực hiện thao tác từ JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        PhuHuynh phuHuynhThucTe = phuHuynhRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy hồ sơ Phụ huynh hợp lệ!"));

        // 2. Tìm chi tiết lịch học
        ChiTietLichHoc chiTiet = chiTietLichHocRepository.findById(idLichHoc)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy chi tiết lịch học này!"));

        //CHỈ PHỤ HUYNH CHỦ SỞ HỮU ĐƠN MỚI ĐƯỢC XIN NGHỈ
        String idPhuHuynhCuaLichHoc = chiTiet.getDangKyHoc().getPhuHuynh().getIdPhuHuynh();
        if (!idPhuHuynhCuaLichHoc.equals(phuHuynhThucTe.getIdPhuHuynh())) {
            throw new RuntimeException("LỖI BẢO MẬT: Bạn không có quyền thao tác trên lịch học của người khác!");
        }

        if ("Đã nghỉ".equalsIgnoreCase(chiTiet.getTinhTrang())) {
            throw new RuntimeException("LỖI: Buổi học này đã được báo nghỉ từ trước!");
        }

        LocalDateTime thoiGianHienTai = LocalDateTime.now();
        LocalDateTime thoiGianHoc = chiTiet.getNgayHoc();

        // 3. RÀNG BUỘC THỜI GIAN: Phải báo trước ít nhất 12 tiếng
        if (thoiGianHienTai.plusHours(12).isAfter(thoiGianHoc)) {
            throw new RuntimeException("LỖI: Bạn phải gửi yêu cầu xin nghỉ trước giờ học ít nhất 12 tiếng!");
        }

        // 4. RÀNG BUỘC SỐ BUỔI: Cho phép nghỉ tối đa 3 buổi / 1 khóa học, lần thứ 4 trở đi hiển thị cảnh báo
        String idDangKy = chiTiet.getDangKyHoc().getIdDangKy();
        long soBuoiDaNghi = chiTietLichHocRepository.countByDangKyHoc_IdDangKyAndTinhTrang(idDangKy, "Đã nghỉ");

        String thongBao = "Yêu cầu xin nghỉ học đã được ghi nhận thành công!";
        
        // Nếu đã nghỉ >= 3 buổi, thêm cảnh báo
        if (soBuoiDaNghi >= 3) {
            thongBao = "⚠️ CẢNH BÁO: Bạn đã nghỉ " + soBuoiDaNghi + " buổi trong khóa học này. Nếu tiếp tục nghỉ, bạn có thể bị đình chỉ học hoặc mất quyền lợi khác. Yêu cầu xin nghỉ vẫn được ghi nhận.";
        }

        // 5. LƯU LÝ DO NGHỈ VÀO BẢNG NoiDungNghi
        NoiDungNghi noiDungNghi = new NoiDungNghi();
        noiDungNghi.setIdNoiDung(generateNextIdNoiDung());
        noiDungNghi.setLyDoNghi(lyDoNghi);
        noiDungNghi.setThoiGianGui(thoiGianHienTai);
        noiDungNghi.setChiTietLichHoc(chiTiet);

        noiDungNghiRepository.save(noiDungNghi);

        // 6. CẬP NHẬT TRẠNG THÁI BẢNG ChiTietLichHoc
        chiTiet.setTinhTrang("Đã nghỉ");
        chiTietLichHocRepository.save(chiTiet);

        return thongBao;
    }
}