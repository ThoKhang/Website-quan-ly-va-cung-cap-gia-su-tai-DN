package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.*;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiaSuSearchService {
    
    private final GiaSuRepository giaSuRepository;
    private final KhoaHocRepository khoaHocRepository;
    private final BangCapRepository bangCapRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final LichDayRepository lichDayRepository;

    /**
     * Tìm kiếm gia sư theo từ khóa và môn học
     */
    public List<GiaSuSearchDTO> timKiemGiaSu(String keyword, String idMonHoc) {
        List<GiaSu> giaSuList = giaSuRepository.timKiemGiaSu(keyword, idMonHoc);
        
        return giaSuList.stream()
                .map(this::convertToGiaSuSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết 1 gia sư
     */
    public GiaSuSearchDTO getGiaSuDetail(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("Gia sư không tồn tại"));
        
        return convertToGiaSuSearchDTO(giaSu);
    }

    /**
     * Convert GiaSu entity sang GiaSuSearchDTO
     */
    private GiaSuSearchDTO convertToGiaSuSearchDTO(GiaSu giaSu) {
        // Lấy danh sách khóa học của gia sư
        List<KhoaHoc> khoaHocs = khoaHocRepository.findByGiaSu_IdGiaSu(giaSu.getIdGiaSu());
        
        // Lấy bằng cấp của gia sư
        List<BangCap> bangCaps = bangCapRepository.findByGiaSu_IdGiaSu(giaSu.getIdGiaSu());
        BangCapDTO bangCapDTO = bangCaps.isEmpty() ? null : 
                convertToBangCapDTO(bangCaps.get(0));
        
        // Tính số sao trung bình của gia sư
        Double soSaoTrungBinh = danhGiaRepository.calculateAverageRatingForGiaSu(giaSu.getIdGiaSu());
        Integer soLuongDanhGia = danhGiaRepository.countRatingForGiaSu(giaSu.getIdGiaSu());
        
        // Lấy lịch rảnh của gia sư
        List<LichDay> lichRanhList = lichDayRepository.findByGiaSu_IdGiaSu(giaSu.getIdGiaSu());
        List<LichRanhDTO> lichRanhDTOs = lichRanhList.stream()
                .map(this::convertToLichRanhDTO)
                .collect(Collectors.toList());
        
        // Convert khóa học
        List<KhoaHocSearchDTO> khoaHocDTOs = khoaHocs.stream()
                .map(this::convertToKhoaHocSearchDTO)
                .collect(Collectors.toList());
        
        return GiaSuSearchDTO.builder()
                .idGiaSu(giaSu.getIdGiaSu())
                .tenGiaSu(giaSu.getTenGiaSu())
                .sdt(giaSu.getSdt())
                .anhDaiDien(giaSu.getTaiKhoan() != null ? giaSu.getTaiKhoan().getAnhDaiDien() : null)
                .heSoLuong(giaSu.getHeSoLuong())
                .soSaoTrungBinh(soSaoTrungBinh != null ? Math.round(soSaoTrungBinh * 10.0) / 10.0 : 0.0)
                .soLuongDanhGia(soLuongDanhGia != null ? soLuongDanhGia : 0)
                .soLuongKhoaHoc(khoaHocs.size())
                .khoaHocs(khoaHocDTOs)
                .bangCap(bangCapDTO)
                .lichRanh(lichRanhDTOs)
                .build();
    }

    /**
     * Convert KhoaHoc entity sang KhoaHocSearchDTO
     */
    private KhoaHocSearchDTO convertToKhoaHocSearchDTO(KhoaHoc khoaHoc) {
        Double soSaoTrungBinh = danhGiaRepository.calculateAverageRatingForKhoaHoc(khoaHoc.getIdKhoaHoc());
        Integer soLuongDanhGia = danhGiaRepository.countRatingForKhoaHoc(khoaHoc.getIdKhoaHoc());
        
        return KhoaHocSearchDTO.builder()
                .idKhoaHoc(khoaHoc.getIdKhoaHoc())
                .tenKhoaHoc(khoaHoc.getTenKhoaHoc())
                .moTa(khoaHoc.getMoTa())
                .yeuCau(khoaHoc.getYeuCau())
                .soTienHoc(khoaHoc.getSoTienHoc())
                .soBuoiHoc(khoaHoc.getSoBuoiHoc())
                .tenMonHoc(khoaHoc.getMonHoc() != null ? khoaHoc.getMonHoc().getTenMonHoc() : null)
                .tenLop(khoaHoc.getDanhMucLop() != null ? khoaHoc.getDanhMucLop().getTenLop() : null)
                .soSaoTrungBinh(soSaoTrungBinh != null ? Math.round(soSaoTrungBinh * 10.0) / 10.0 : 0.0)
                .soLuongDanhGia(soLuongDanhGia != null ? soLuongDanhGia : 0)
                .build();
    }

    /**
     * Convert BangCap entity sang BangCapDTO
     */
    private BangCapDTO convertToBangCapDTO(BangCap bangCap) {
        // LocalDate không có giờ, nên không cần format
        // @JsonFormat trong DTO sẽ tự động format thành dd/MM/yyyy
        return BangCapDTO.builder()
                .idBangCap(bangCap.getIdBangCap())
                .tenBangCap(bangCap.getTenBangCap())
                .thongTinBangCap(bangCap.getThongTinBangCap())
                .ngayCap(bangCap.getNgayCap())
                .trangThai(bangCap.getTrangThai())
                .anhMinhChung(bangCap.getAnhMinhChung())
                .build();
    }

    /**
     * Convert LichDay entity sang LichRanhDTO
     */
    private LichRanhDTO convertToLichRanhDTO(LichDay lichDay) {
        TietHoc tietHoc = lichDay.getTietHoc();
        
        LichRanhDTO.TietHocDTO tietHocDTO = LichRanhDTO.TietHocDTO.builder()
                .idTietHoc(tietHoc.getIdTietHoc())
                .thu(tietHoc.getThu())
                .gioBatDau(tietHoc.getGioBatDau())
                .gioKetThuc(tietHoc.getGioKetThuc())
                .soTiet(tietHoc.getSoTiet())
                .build();
        
        return LichRanhDTO.builder()
                .idLichDay(lichDay.getIdLichDay())
                .tinhTrang(lichDay.getTinhTrang())
                .tietHoc(tietHocDTO)
                .build();
    }
}
