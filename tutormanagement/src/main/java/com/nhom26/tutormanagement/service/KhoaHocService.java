package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.KhoaHocRequestDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.entity.*;
import com.nhom26.tutormanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhoaHocService {

    private final KhoaHocRepository khoaHocRepository;
    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final MonHocRepository monHocRepository;
    private final DanhMucLopRepository danhMucLopRepository;
    private final TietHocRepository tietHocRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final DangKyHocRepository dangKyHocRepository;

    private String generateNextIdKhoaHoc() {
        try {
            List<String> allIds = khoaHocRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return "KH001";
            }
            
            int maxNumber = 0;
            for (String id : allIds) {
                try {
                    String trimmedId = id.trim();
                    if (trimmedId.startsWith("KH") && trimmedId.length() >= 5) {
                        int number = Integer.parseInt(trimmedId.substring(2, 5));
                        if (number > maxNumber) {
                            maxNumber = number;
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid IDs
                }
            }
            
            return String.format("KH%03d", maxNumber + 1);
        } catch (Exception e) {
            return "KH001";
        }
    }

    private int getCurrentMaxLichDayNumber() {
        try {
            List<String> allIds = lichDayRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return 0;
            }
            
            int maxNumber = 0;
            for (String id : allIds) {
                try {
                    String trimmedId = id.trim();
                    if (trimmedId.startsWith("LD") && trimmedId.length() >= 5) {
                        int number = Integer.parseInt(trimmedId.substring(2, 5));
                        if (number > maxNumber) {
                            maxNumber = number;
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid IDs
                }
            }
            
            return maxNumber;
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional 
    public String taoKhoaHocVaLichRanh(KhoaHocRequestDTO request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn chưa có hồ sơ Gia sư!"));
        
        MonHoc monHoc = monHocRepository.findById(request.getIdMonHoc())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Môn học!"));
        DanhMucLop danhMucLop = danhMucLopRepository.findById(request.getIdDanhMucLop())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục lớp!"));

        KhoaHoc khoaHocMoi = new KhoaHoc();
        khoaHocMoi.setIdKhoaHoc(generateNextIdKhoaHoc()); 
        khoaHocMoi.setTenKhoaHoc(request.getTenKhoaHoc());
        khoaHocMoi.setMoTa(request.getMoTa());
        khoaHocMoi.setYeuCau(request.getYeuCau());
        khoaHocMoi.setNoiDungKhoaHoc(request.getNoiDungKhoaHoc());
        khoaHocMoi.setSoTienHoc(request.getSoTienHoc());
        khoaHocMoi.setSoBuoiHoc(request.getSoBuoiHoc());
        
        // THÊM: Gán link ảnh lúc tạo mới
        khoaHocMoi.setAnhMinhHoa(request.getAnhMinhHoa());
        
        khoaHocMoi.setTinhTrang(0);
        khoaHocMoi.setGiaSu(giaSu);
        khoaHocMoi.setMonHoc(monHoc);
        khoaHocMoi.setDanhMucLop(danhMucLop);
        
        khoaHocRepository.save(khoaHocMoi);

        if (request.getDanhSachIdTietHocRanh() != null && !request.getDanhSachIdTietHocRanh().isEmpty()) {
            int currentLDNumber = getCurrentMaxLichDayNumber(); 
            
            for (String idTietHoc : request.getDanhSachIdTietHocRanh()) {
                TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Tiết học có ID: " + idTietHoc));
                
                LichDay lichDayMoi = new LichDay();
                currentLDNumber++; 
                lichDayMoi.setIdLichDay(String.format("LD%03d", currentLDNumber)); 
                lichDayMoi.setTinhTrang(true); 
                lichDayMoi.setGiaSu(giaSu);
                lichDayMoi.setTietHoc(tietHoc);
                
                lichDayRepository.save(lichDayMoi);
            }
        }
        return "Tạo khóa học thành công! Vui lòng chờ Admin phê duyệt.";
    }

    public List<KhoaHocResponseDTO> timKiemKhoaHoc(String keyword, String idMonHoc, String idDanhMucLop,
                                                   BigDecimal minPrice, BigDecimal maxPrice) {
        String normalizedKeyword = chuanHoaChuoi(keyword);
        String normalizedIdMonHoc = chuanHoaChuoi(idMonHoc);
        String normalizedIdDanhMucLop = chuanHoaChuoi(idDanhMucLop);

        List<KhoaHoc> danhSachKhoaHoc = khoaHocRepository.timKiemVaLoc(
                normalizedKeyword,
                normalizedIdMonHoc,
                normalizedIdDanhMucLop,
                minPrice,
                maxPrice
        );

        return danhSachKhoaHoc.stream()
                .filter(khoaHoc -> khoaHoc.getTinhTrang() != null && khoaHoc.getTinhTrang() == 1)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String duyetKhoaHoc(String idKhoaHoc, Integer trangThaiMoi) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("LỖI: Khóa học không tồn tại!"));
        
        khoaHoc.setTinhTrang(trangThaiMoi);
        khoaHocRepository.save(khoaHoc);

        if (trangThaiMoi == 1) return "Đã duyệt khóa học: " + khoaHoc.getTenKhoaHoc();
        if (trangThaiMoi == 2) return "Đã từ chối khóa học: " + khoaHoc.getTenKhoaHoc();
        return "Đã cập nhật trạng thái khóa học.";
    }

    private String chuanHoaChuoi(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return Objects.equals(trimmed, "") ? null : trimmed;
    }

    public List<KhoaHocResponseDTO> getKhoaHocByGiaSu(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gia sư!"));
        
        List<KhoaHoc> danhSachKhoaHoc = khoaHocRepository.findByGiaSu_IdGiaSu(idGiaSu);
        
        return danhSachKhoaHoc.stream()
                .filter(khoaHoc -> khoaHoc.getTinhTrang() == null || khoaHoc.getTinhTrang() != -1)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public KhoaHocResponseDTO getKhoaHocDetail(String idKhoaHoc) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        
        return mapToResponseDTO(khoaHoc);
    }

    @Transactional
    public String updateKhoaHoc(String idKhoaHoc, KhoaHocRequestDTO request) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        
        khoaHoc.setTenKhoaHoc(request.getTenKhoaHoc());
        khoaHoc.setMoTa(request.getMoTa());
        khoaHoc.setYeuCau(request.getYeuCau());
        khoaHoc.setNoiDungKhoaHoc(request.getNoiDungKhoaHoc());
        khoaHoc.setSoTienHoc(request.getSoTienHoc());
        khoaHoc.setSoBuoiHoc(request.getSoBuoiHoc());
        
        // THÊM: Gán link ảnh lúc update
        if(request.getAnhMinhHoa() != null) {
            khoaHoc.setAnhMinhHoa(request.getAnhMinhHoa());
        }
        
        // ----------------------------------------------------
        // THÊM ĐÚNG 1 DÒNG NÀY VÀO ĐÂY:
        khoaHoc.setTinhTrang(0); // Ép về trạng thái Chờ duyệt
        // ----------------------------------------------------

        khoaHocRepository.save(khoaHoc);
        return "Cập nhật khóa học thành công!";
    }

    @Transactional
    public String deleteKhoaHoc(String idKhoaHoc) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        
        // Chốt chặn an toàn: Nếu đang có người học thì không cho xóa
        boolean isLocked = dangKyHocRepository.existsHocVienDangHoc(idKhoaHoc);
        if (isLocked) {
            throw new RuntimeException("LỖI: Khóa học này đang có học viên theo học, không thể xóa!");
        }

        // XÓA MỀM: Chuyển trạng thái thành -1 (Đã ẩn/Đã xóa)
        khoaHoc.setTinhTrang(-1);
        
        khoaHocRepository.save(khoaHoc);
        return "Xóa (ẩn) khóa học thành công!";
    }

    public KhoaHocResponseDTO mapToResponseDTO(KhoaHoc khoaHoc) {
        KhoaHocResponseDTO dto = new KhoaHocResponseDTO();
        dto.setIdKhoaHoc(khoaHoc.getIdKhoaHoc());
        dto.setTenKhoaHoc(khoaHoc.getTenKhoaHoc());
        dto.setMoTa(khoaHoc.getMoTa());
        dto.setYeuCau(khoaHoc.getYeuCau());
        dto.setNoiDungKhoaHoc(khoaHoc.getNoiDungKhoaHoc());
        dto.setSoTienHoc(khoaHoc.getSoTienHoc());
        dto.setSoBuoiHoc(khoaHoc.getSoBuoiHoc());
        dto.setTrangThai(khoaHoc.getTinhTrang());
        
        // THÊM: Map trường ảnh ra DTO
        dto.setAnhMinhHoa(khoaHoc.getAnhMinhHoa());
        
        if (khoaHoc.getMonHoc() != null){
            dto.setTenMonHoc(khoaHoc.getMonHoc().getTenMonHoc());
            dto.setIdMonHoc(khoaHoc.getMonHoc().getIdMonHoc());
        }
        if (khoaHoc.getDanhMucLop() != null){
            dto.setTenLop(khoaHoc.getDanhMucLop().getTenLop());
            dto.setIdDanhMucLop(khoaHoc.getDanhMucLop().getIdDanhMucLop());
        }
        if (khoaHoc.getGiaSu() != null) {
            dto.setIdGiaSu(khoaHoc.getGiaSu().getIdGiaSu());
            dto.setTenGiaSu(khoaHoc.getGiaSu().getTenGiaSu());
            
            Double sao = danhGiaRepository.calculateAverageRatingForGiaSu(khoaHoc.getGiaSu().getIdGiaSu());
            dto.setSaoTrungBinh(sao != null ? Math.round(sao * 10.0) / 10.0 : 0.0);
        }
        return dto;
    }

    // ==========================================
    // 1. HÀM CẬP NHẬT KHÓA HỌC
    // ==========================================
    @Transactional
    public KhoaHoc capNhatKhoaHoc(String idKhoaHoc, KhoaHocRequestDTO request) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        // Chỉ khóa khi có học viên ĐANG HỌC (chưa hoàn thành)
        boolean isLocked = dangKyHocRepository.existsHocVienDangHoc(idKhoaHoc);
        if (isLocked) {
            throw new RuntimeException("Không thể chỉnh sửa! Khóa học này đang có học viên ĐANG HỌC.");
        }

        // Cập nhật thông tin
        khoaHoc.setTenKhoaHoc(request.getTenKhoaHoc());
        khoaHoc.setMoTa(request.getMoTa());
        khoaHoc.setYeuCau(request.getYeuCau());
        khoaHoc.setNoiDungKhoaHoc(request.getNoiDungKhoaHoc());
        khoaHoc.setSoTienHoc(request.getSoTienHoc());
        khoaHoc.setSoBuoiHoc(request.getSoBuoiHoc());
        
        // THÊM: Gán link ảnh lúc cập nhật
        if(request.getAnhMinhHoa() != null) {
            khoaHoc.setAnhMinhHoa(request.getAnhMinhHoa());
        }

        // Đưa về trạng thái Chờ duyệt (0)
        khoaHoc.setTinhTrang(0); 

        return khoaHocRepository.save(khoaHoc);
    }

    // ==========================================
    // 2. HÀM XÓA KHÓA HỌC (XÓA MỀM)
    // ==========================================
    @Transactional
    public String xoaKhoaHoc(String idKhoaHoc) {
        KhoaHoc khoaHoc = khoaHocRepository.findById(idKhoaHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        // Chỉ chặn xóa nếu có người ĐANG HỌC
        boolean isLocked = dangKyHocRepository.existsHocVienDangHoc(idKhoaHoc);
        if (isLocked) {
            throw new RuntimeException("Không thể xóa! Khóa học này đang có học viên ĐANG HỌC.");
        }

        // XÓA MỀM: Đổi tinhTrang thành -1 (Ẩn/Đã xóa) thay vì dùng lệnh delete()
        // Việc này giúp lịch sử học của học viên cũ (đã hoàn thành) không bị sụp đổ
        khoaHoc.setTinhTrang(-1);
        khoaHocRepository.save(khoaHoc);
        
        return "Đã xóa (ẩn) khóa học thành công!";
    }
}