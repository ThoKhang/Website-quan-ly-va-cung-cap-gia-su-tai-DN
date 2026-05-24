package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ChiTietLichHocResponseDTO;
import com.nhom26.tutormanagement.dto.DangKyHocResponseDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.entity.YeuCauGiaHan;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.YeuCauGiaHanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DangKyHocService {

    private final DangKyHocRepository dangKyHocRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    private final KhoaHocService khoaHocService;
    private final YeuCauGiaHanRepository yeuCauGiaHanRepository; // Inject thêm Repo này

    /**
     * Lấy danh sách khóa học đã đăng ký của phụ huynh (Lịch sử)
     */
    public List<DangKyHocResponseDTO> layLichSuKhoaHoc(String idPhuHuynh) {
        List<DangKyHoc> danhSachDangKy = dangKyHocRepository.findByPhuHuynh_IdPhuHuynhOrderByNgayDangKyDesc(idPhuHuynh);

        return danhSachDangKy.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi DangKyHoc entity sang DangKyHocResponseDTO
     */
    private DangKyHocResponseDTO mapToResponseDTO(DangKyHoc dangKyHoc) {
        KhoaHocResponseDTO khoaHocDTO = khoaHocService.mapToResponseDTO(dangKyHoc.getKhoaHoc());

        List<ChiTietLichHoc> chiTietList = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(dangKyHoc.getIdDangKy());
        List<ChiTietLichHocResponseDTO> chiTietDTOList = chiTietList.stream()
                .map(this::mapChiTietToDTO)
                .collect(Collectors.toList());

        return DangKyHocResponseDTO.builder()
                .idDangKy(dangKyHoc.getIdDangKy())
                .khoaHoc(khoaHocDTO)
                .ngayDangKy(dangKyHoc.getNgayDangKy())
                .ngayBatDauHoc(dangKyHoc.getNgayBatDauHoc())
                .ngayKetThucDuKien(dangKyHoc.getNgayKetThucDuKien())
                // ĐÃ XÓA: .ngayGiaHan(dangKyHoc.getNgayGiaHan()) vì không còn dùng ở bảng này nữa
                .chiTietLichHoc(chiTietDTOList)
                .build();
    }

    /**
     * Chuyển đổi ChiTietLichHoc entity sang ChiTietLichHocResponseDTO
     */
    private ChiTietLichHocResponseDTO mapChiTietToDTO(ChiTietLichHoc chiTiet) {
        LichDay lichDay = chiTiet.getLichDay();
        
        LichRanhDTO lichRanhDTO = LichRanhDTO.builder()
                .idLichDay(lichDay.getIdLichDay())
                .tinhTrang(lichDay.getTinhTrang())
                .tietHoc(LichRanhDTO.TietHocDTO.builder()
                        .idTietHoc(lichDay.getTietHoc().getIdTietHoc())
                        .thu(lichDay.getTietHoc().getThu())
                        .gioBatDau(lichDay.getTietHoc().getGioBatDau())
                        .gioKetThuc(lichDay.getTietHoc().getGioKetThuc())
                        .soTiet(lichDay.getTietHoc().getSoTiet())
                        .build())
                .build();

        return ChiTietLichHocResponseDTO.builder()
                .idLichHoc(chiTiet.getIdLichHoc())
                .ngayHoc(chiTiet.getNgayHoc())
                .tinhTrang(chiTiet.getTinhTrang())
                .lichDay(lichRanhDTO)
                .build();
    }

    /**
     * Lấy chi tiết một khóa học đã đăng ký
     */
    public DangKyHocResponseDTO layChiTietDangKyHoc(String idDangKy) {
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học đã đăng ký"));

        return mapToResponseDTO(dangKyHoc);
    }

    /**
     * LUỒNG MỚI: Gửi yêu cầu gia hạn khóa học (Học viên/Phụ huynh gọi hàm này)
     */
    public String guiYeuCauGiaHan(String idDangKy, Integer soBuoiGiaHan, String loaiGiaHan) {
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học đang đăng ký!"));

        // 1. Kiểm tra xem có đơn nào đang "Chờ duyệt" chưa, tránh việc học viên spam click gửi nhiều đơn
        boolean daCoDonCho = yeuCauGiaHanRepository.existsByDangKyHoc_IdDangKyAndTrangThaiDuyet(idDangKy, "Chờ duyệt");
        if (daCoDonCho) {
            throw new RuntimeException("Bạn đã gửi một yêu cầu gia hạn trước đó rồi. Vui lòng chờ Gia sư phê duyệt!");
        }

        // 2. Tạo đơn yêu cầu mới
        YeuCauGiaHan yeuCauMoi = new YeuCauGiaHan();
        yeuCauMoi.setIdGiaHan("GH" + System.currentTimeMillis()); // Generate ID nhanh
        yeuCauMoi.setDangKyHoc(dangKyHoc);
        yeuCauMoi.setSoBuoiGiaHan(soBuoiGiaHan);
        yeuCauMoi.setLoaiGiaHan(loaiGiaHan); // "Toàn bộ" hoặc "Tùy chọn"
        yeuCauMoi.setNgayYeuCau(LocalDateTime.now());
        yeuCauMoi.setTrangThaiDuyet("Chờ duyệt");

        yeuCauGiaHanRepository.save(yeuCauMoi);
        
        // 3. (Tùy chọn) Cập nhật trạng thái hiển thị bên bảng Đăng Ký Học cho dễ nhìn
        dangKyHoc.setLoaiDangKy("Yêu cầu gia hạn");
        dangKyHocRepository.save(dangKyHoc);

        return "Đã gửi yêu cầu gia hạn " + soBuoiGiaHan + " buổi thành công. Vui lòng chờ Gia sư xác nhận!";
    }
    private String generateNextIdGiaHan() {
        String maxId = yeuCauGiaHanRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "GH00001";
        return String.format("GH%05d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }
}