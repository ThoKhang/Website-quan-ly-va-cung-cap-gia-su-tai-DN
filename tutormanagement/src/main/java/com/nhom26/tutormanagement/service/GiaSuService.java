

package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.GiaSuProfileDTO;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class GiaSuService {

    private final GiaSuRepository giaSuRepository;

    /**
     * NGHIỆP VỤ 1: Kiểm tra tính hợp lệ trước khi cho phép tạo Khóa học.
     * Chỉ gia sư có trạng thái = 1 (Đã duyệt) mới được phép thiết lập lớp.
     */
    @Transactional(readOnly = true)
    public boolean kiemTraDieuKienTaoKhoaHoc(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Gia sư với ID: " + idGiaSu));

        // Dựa theo dữ liệu mẫu: trangThai = 1 nghĩa là tài khoản đã qua kiểm duyệt
        return giaSu.getTrangThai() != null && giaSu.getTrangThai() == 1;
    }

    /**
     * NGHIỆP VỤ 2: Lấy thông tin hồ sơ rút gọn.
     */
    @Transactional(readOnly = true)
    public GiaSuProfileDTO layHoSoGiaSu(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Gia sư với ID: " + idGiaSu));

        GiaSuProfileDTO profileDTO = new GiaSuProfileDTO();
        profileDTO.setIdGiaSu(giaSu.getIdGiaSu());
        profileDTO.setTenGiaSu(giaSu.getTenGiaSu());
        profileDTO.setTrangThai(giaSu.getTrangThai());

        // Lấy ảnh đại diện từ bảng TaiKhoan (Quan hệ @OneToOne đã thiết lập)
        if (giaSu.getTaiKhoan() != null && giaSu.getTaiKhoan().getAnhDaiDien() != null) {
            profileDTO.setAnhDaiDien(giaSu.getTaiKhoan().getAnhDaiDien());
        } else {
            // Có thể trả về một URL ảnh mặc định nếu gia sư chưa cập nhật ảnh
            profileDTO.setAnhDaiDien("default-avatar.png");
        }

        return profileDTO;
    }
}