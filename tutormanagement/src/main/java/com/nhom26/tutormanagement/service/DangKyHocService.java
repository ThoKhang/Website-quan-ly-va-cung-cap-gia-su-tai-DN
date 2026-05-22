package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ChiTietLichHocResponseDTO;
import com.nhom26.tutormanagement.dto.DangKyHocResponseDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DangKyHocService {

    private final DangKyHocRepository dangKyHocRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    private final KhoaHocService khoaHocService;

    /**
     * Lấy danh sách khóa học đã đăng ký của phụ huynh (Lịch sử)
     */
    public List<DangKyHocResponseDTO> layLichSuKhoaHoc(String idPhuHuynh) {
        // Lấy danh sách DangKyHoc theo idPhuHuynh, sắp xếp theo ngày đăng ký giảm dần
        List<DangKyHoc> danhSachDangKy = dangKyHocRepository.findByPhuHuynh_IdPhuHuynhOrderByNgayDangKyDesc(idPhuHuynh);

        // Chuyển đổi từ Entity sang DTO
        return danhSachDangKy.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi DangKyHoc entity sang DangKyHocResponseDTO
     */
    private DangKyHocResponseDTO mapToResponseDTO(DangKyHoc dangKyHoc) {
        // Lấy thông tin khóa học
        KhoaHocResponseDTO khoaHocDTO = khoaHocService.mapToResponseDTO(dangKyHoc.getKhoaHoc());

        // Lấy danh sách chi tiết lịch học
        List<ChiTietLichHoc> chiTietList = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(dangKyHoc.getIdDangKy());
        List<ChiTietLichHocResponseDTO> chiTietDTOList = chiTietList.stream()
                .map(this::mapChiTietToDTO)
                .collect(Collectors.toList());

        return DangKyHocResponseDTO.builder()
                .idDangKy(dangKyHoc.getIdDangKy())
                .khoaHoc(khoaHocDTO)
                .ngayDangKy(dangKyHoc.getNgayDangKy())
                .ngayBatDauHoc(dangKyHoc.getNgayBatDauHoc())
                .trangThaiThanhToan(dangKyHoc.getTrangThaiThanhToan())
                .trangThaiHoanThanh(dangKyHoc.getTrangThaiHoanThanh())
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
}
