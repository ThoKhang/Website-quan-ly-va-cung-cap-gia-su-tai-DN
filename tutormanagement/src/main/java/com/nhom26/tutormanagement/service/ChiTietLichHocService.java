package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ChiTietLichHocDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.DanhGiaRepository;
import com.nhom26.tutormanagement.repository.KhoaHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChiTietLichHocService {
    
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final KhoaHocRepository khoaHocRepository;

    /**
     * Lấy chi tiết lịch học theo ID đăng ký
     */
    public List<ChiTietLichHocDTO> getScheduleDetailByDangKy(String idDangKy) {
        List<ChiTietLichHoc> chiTietLichHocs = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(idDangKy);
        
        return chiTietLichHocs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert ChiTietLichHoc entity sang ChiTietLichHocDTO
     */
    private ChiTietLichHocDTO convertToDTO(ChiTietLichHoc chiTietLichHoc) {
        LichDay lichDay = chiTietLichHoc.getLichDay();
        GiaSu giaSu = lichDay.getGiaSu();
        TietHoc tietHoc = lichDay.getTietHoc();
        KhoaHoc khoaHoc = chiTietLichHoc.getDangKyHoc().getKhoaHoc();
        
        // Tính đánh giá trung bình của gia sư
        Double soSaoTrungBinh = danhGiaRepository.calculateAverageRatingForGiaSu(giaSu.getIdGiaSu());
        Integer soLuongDanhGia = danhGiaRepository.countRatingForGiaSu(giaSu.getIdGiaSu());
        
        // Lấy số khóa học của gia sư
        List<KhoaHoc> khoaHocList = khoaHocRepository.findByGiaSu_IdGiaSu(giaSu.getIdGiaSu());
        
        ChiTietLichHocDTO.LichDayDTO.GiaSuDTO giaSuDTO = ChiTietLichHocDTO.LichDayDTO.GiaSuDTO.builder()
                .idGiaSu(giaSu.getIdGiaSu())
                .tenGiaSu(giaSu.getTenGiaSu())
                .sdt(giaSu.getSdt())
                .email(giaSu.getTaiKhoan() != null ? giaSu.getTaiKhoan().getEmail() : null)
                .saoTrungBinh(soSaoTrungBinh != null ? Math.round(soSaoTrungBinh * 10.0) / 10.0 : 0.0)
                .soLuongKhoaHoc(khoaHocList.size())
                .soLuongDanhGia(soLuongDanhGia != null ? soLuongDanhGia : 0)
                .build();
        
        ChiTietLichHocDTO.LichDayDTO.TietHocDTO tietHocDTO = ChiTietLichHocDTO.LichDayDTO.TietHocDTO.builder()
                .idTietHoc(tietHoc.getIdTietHoc())
                .thu(tietHoc.getThu())
                .gioBatDau(tietHoc.getGioBatDau())
                .gioKetThuc(tietHoc.getGioKetThuc())
                .soTiet(tietHoc.getSoTiet())
                .build();
        
        ChiTietLichHocDTO.LichDayDTO lichDayDTO = ChiTietLichHocDTO.LichDayDTO.builder()
                .idLichDay(lichDay.getIdLichDay())
                .tinhTrang(lichDay.getTinhTrang())
                .giaSu(giaSuDTO)
                .tietHoc(tietHocDTO)
                .build();
        
        // Tính đánh giá khóa học
        Double soSaoKhoaHoc = danhGiaRepository.calculateAverageRatingForKhoaHoc(khoaHoc.getIdKhoaHoc());
        Integer soLuongDanhGiaKhoaHoc = danhGiaRepository.countRatingForKhoaHoc(khoaHoc.getIdKhoaHoc());
        
        ChiTietLichHocDTO.KhoaHocDTO khoaHocDTO = ChiTietLichHocDTO.KhoaHocDTO.builder()
                .idKhoaHoc(khoaHoc.getIdKhoaHoc())
                .tenKhoaHoc(khoaHoc.getTenKhoaHoc())
                .moTa(khoaHoc.getMoTa())
                .yeuCau(khoaHoc.getYeuCau())
                .soTienHoc(khoaHoc.getSoTienHoc())
                .soBuoiHoc(khoaHoc.getSoBuoiHoc())
                .tenMonHoc(khoaHoc.getMonHoc() != null ? khoaHoc.getMonHoc().getTenMonHoc() : null)
                .tenLop(khoaHoc.getDanhMucLop() != null ? khoaHoc.getDanhMucLop().getTenLop() : null)
                .soSaoTrungBinh(soSaoKhoaHoc != null ? Math.round(soSaoKhoaHoc * 10.0) / 10.0 : 0.0)
                .soLuongDanhGia(soLuongDanhGiaKhoaHoc != null ? soLuongDanhGiaKhoaHoc : 0)
                .build();
        
        return ChiTietLichHocDTO.builder()
                .idLichHoc(chiTietLichHoc.getIdLichHoc())
                .ngayHoc(chiTietLichHoc.getNgayHoc())
                .tinhTrang(chiTietLichHoc.getTinhTrang())
                .lichDay(lichDayDTO)
                .khoaHoc(khoaHocDTO)
                .build();
    }
}
