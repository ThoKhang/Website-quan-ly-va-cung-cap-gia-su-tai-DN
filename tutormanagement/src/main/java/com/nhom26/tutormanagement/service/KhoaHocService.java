package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.KhoaHocRequestDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import com.nhom26.tutormanagement.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhoaHocService {

    // Khai báo đầy đủ các Repository cần dùng
    private final KhoaHocRepository khoaHocRepository;
    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final MonHocRepository monHocRepository;
    private final DanhMucLopRepository danhMucLopRepository;
    private final TietHocRepository tietHocRepository;
    private final DanhGiaRepository danhGiaRepository;

    /**
     * HÀM 1: GIA SƯ TẠO KHÓA HỌC VÀ LỊCH RẢNH
     */
    @Transactional 
    public String taoKhoaHocVaLichRanh(KhoaHocRequestDTO request) {
        
        GiaSu giaSu = giaSuRepository.findById(request.getIdGiaSu())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gia sư với ID: " + request.getIdGiaSu()));
        MonHoc monHoc = monHocRepository.findById(request.getIdMonHoc())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Môn học!"));
        DanhMucLop danhMucLop = danhMucLopRepository.findById(request.getIdDanhMucLop())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục lớp!"));

        KhoaHoc khoaHocMoi = new KhoaHoc();
        khoaHocMoi.setIdKhoaHoc(IdGeneratorUtil.generateId());
        khoaHocMoi.setTenKhoaHoc(request.getTenKhoaHoc());
        khoaHocMoi.setMoTa(request.getMoTa());
        khoaHocMoi.setYeuCau(request.getYeuCau());
        khoaHocMoi.setNoiDungKhoaHoc(request.getNoiDungKhoaHoc());
        khoaHocMoi.setSoTienHoc(request.getSoTienHoc());
        
        khoaHocMoi.setGiaSu(giaSu);
        khoaHocMoi.setMonHoc(monHoc);
        khoaHocMoi.setDanhMucLop(danhMucLop);
        
        khoaHocRepository.save(khoaHocMoi);

        if (request.getDanhSachIdTietHocRanh() != null && !request.getDanhSachIdTietHocRanh().isEmpty()) {
            for (String idTietHoc : request.getDanhSachIdTietHocRanh()) {
                TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Tiết học có ID: " + idTietHoc));
                
                LichDay lichDayMoi = new LichDay();
                lichDayMoi.setIdLichDay(IdGeneratorUtil.generateId());
                lichDayMoi.setTinhTrang(true); 
                lichDayMoi.setGiaSu(giaSu);
                lichDayMoi.setTietHoc(tietHoc);
                
                lichDayRepository.save(lichDayMoi);
            }
        }
        return "Tạo khóa học và thiết lập lịch rảnh thành công!";
    }

    /**
     * HÀM 2: TÌM KIẾM KHÓA HỌC (CHO TRANG CHỦ)
     */
    public List<KhoaHocResponseDTO> timKiemKhoaHoc(String idMonHoc, String idDanhMucLop, BigDecimal maxPrice) {
        
        List<KhoaHoc> danhSachKhoaHoc;

        if (idMonHoc != null && idDanhMucLop != null && maxPrice != null) {
            danhSachKhoaHoc = khoaHocRepository.findByMonHoc_IdMonHocAndDanhMucLop_IdDanhMucLopAndSoTienHocLessThanEqual(idMonHoc, idDanhMucLop, maxPrice);
        } else {
            danhSachKhoaHoc = khoaHocRepository.findAll();
        }

        return danhSachKhoaHoc.stream().map(khoaHoc -> {
            KhoaHocResponseDTO dto = new KhoaHocResponseDTO();
            dto.setIdKhoaHoc(khoaHoc.getIdKhoaHoc());
            dto.setTenKhoaHoc(khoaHoc.getTenKhoaHoc());
            dto.setSoTienHoc(khoaHoc.getSoTienHoc());
            
            if (khoaHoc.getMonHoc() != null) dto.setTenMonHoc(khoaHoc.getMonHoc().getTenMonHoc());
            if (khoaHoc.getDanhMucLop() != null) dto.setTenLop(khoaHoc.getDanhMucLop().getTenLop());
            if (khoaHoc.getGiaSu() != null) {
                dto.setTenGiaSu(khoaHoc.getGiaSu().getTenGiaSu());
                
                Double sao = danhGiaRepository.calculateAverageRatingForGiaSu(khoaHoc.getGiaSu().getIdGiaSu());
                dto.setSaoTrungBinh(sao != null ? Math.round(sao * 10.0) / 10.0 : 0.0);
            }
            return dto;
        }).collect(Collectors.toList());
    }
}