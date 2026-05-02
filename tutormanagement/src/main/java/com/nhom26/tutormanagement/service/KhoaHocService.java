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

    // Khai báo đầy đủ các Repository và Util cần dùng
    private final KhoaHocRepository khoaHocRepository;
    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final MonHocRepository monHocRepository;
    private final DanhMucLopRepository danhMucLopRepository;
    private final TietHocRepository tietHocRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final IdGeneratorUtil idGeneratorUtil;

    /**
     * HÀM 1: GIA SƯ TẠO KHÓA HỌC VÀ ĐĂNG KÝ LỊCH RẢNH
     * (Đã gộp hàm, fix lỗi trùng lịch và chuẩn hóa trả về DTO)
     */
    @Transactional
    public KhoaHocResponseDTO thietLapKhoaHocVaLich(KhoaHocRequestDTO request) {
        // 1. Tìm kiếm và kiểm tra các thực thể liên quan
        GiaSu giaSu = giaSuRepository.findById(request.getIdGiaSu())
                .orElseThrow(() -> new RuntimeException("Gia sư không tồn tại"));
        
        MonHoc monHoc = monHocRepository.findById(request.getIdMonHoc())
                .orElseThrow(() -> new RuntimeException("Môn học không hợp lệ"));
        
        DanhMucLop danhMucLop = danhMucLopRepository.findById(request.getIdDanhMucLop())
                .orElseThrow(() -> new RuntimeException("Danh mục lớp không hợp lệ"));

        // 2. Xử lý lưu Khóa học mới
        KhoaHoc khoaHoc = new KhoaHoc();
        // Tạo ID mới dựa trên ID lớn nhất hiện có
        String nextIdKH = idGeneratorUtil.generateNextId(khoaHocRepository.findMaxId(), "KH");
        
        khoaHoc.setIdKhoaHoc(nextIdKH);
        khoaHoc.setTenKhoaHoc(request.getTenKhoaHoc());
        khoaHoc.setMoTa(request.getMoTa());
        khoaHoc.setYeuCau(request.getYeuCau());
        khoaHoc.setNoiDungKhoaHoc(request.getNoiDungKhoaHoc());
        khoaHoc.setSoTienHoc(request.getSoTienHoc());
        khoaHoc.setGiaSu(giaSu);
        khoaHoc.setMonHoc(monHoc);
        khoaHoc.setDanhMucLop(danhMucLop);
        
        khoaHocRepository.save(khoaHoc);

        // 3. Xử lý logic "bung" lịch rảnh vào bảng LichDay (Có kiểm tra trùng lặp)
        if (request.getDanhSachIdTietHocRanh() != null && !request.getDanhSachIdTietHocRanh().isEmpty()) {
            for (String idTietHoc : request.getDanhSachIdTietHocRanh()) {
                TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                        .orElseThrow(() -> new RuntimeException("Tiết học " + idTietHoc + " không tồn tại"));

                // Kiểm tra xem Gia sư đã có lịch rảnh vào tiết này chưa
                boolean isExist = lichDayRepository.existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(giaSu.getIdGiaSu(), idTietHoc);
                
                if (!isExist) {
                    LichDay lichRanh = new LichDay();
                    String nextIdLD = idGeneratorUtil.generateNextId(lichDayRepository.findMaxId(), "LD");
                    
                    lichRanh.setIdLichDay(nextIdLD);
                    lichRanh.setGiaSu(giaSu);
                    lichRanh.setTietHoc(tietHoc);
                    lichRanh.setTinhTrang(true); // Đánh dấu là khung giờ "Rảnh"
                    
                    lichDayRepository.save(lichRanh);
                }
            }
        }

        return mapToResponseDTO(khoaHoc);
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

        return danhSachKhoaHoc.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * HÀM 3: LẤY DANH SÁCH KHÓA HỌC HIỂN THỊ
     */
    public List<KhoaHocResponseDTO> getAllKhoaHoc() {
        return khoaHocRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * HÀM HELPER: Chuyển đổi từ Entity sang DTO để trả về cho Frontend
     * (Đã đồng bộ logic tính điểm đánh giá)
     */
    private KhoaHocResponseDTO mapToResponseDTO(KhoaHoc khoaHoc) {
        KhoaHocResponseDTO dto = new KhoaHocResponseDTO();
        dto.setIdKhoaHoc(khoaHoc.getIdKhoaHoc());
        dto.setTenKhoaHoc(khoaHoc.getTenKhoaHoc());
        dto.setSoTienHoc(khoaHoc.getSoTienHoc());
        
        if (khoaHoc.getMonHoc() != null) {
            dto.setTenMonHoc(khoaHoc.getMonHoc().getTenMonHoc());
        }
        if (khoaHoc.getDanhMucLop() != null) {
            dto.setTenLop(khoaHoc.getDanhMucLop().getTenLop());
        }
        
        if (khoaHoc.getGiaSu() != null) {
            dto.setTenGiaSu(khoaHoc.getGiaSu().getTenGiaSu());
            
            // Tính số sao trung bình từ Database
            Double sao = danhGiaRepository.calculateAverageRatingForGiaSu(khoaHoc.getGiaSu().getIdGiaSu());
            dto.setSaoTrungBinh(sao != null ? Math.round(sao * 10.0) / 10.0 : 0.0);
        } else {
            dto.setSaoTrungBinh(0.0);
        }
        
        return dto;
    }
}