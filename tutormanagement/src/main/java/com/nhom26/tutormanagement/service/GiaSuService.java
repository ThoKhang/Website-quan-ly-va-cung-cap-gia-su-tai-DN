package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BangCapDTO;
import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.DangKyLichRanhRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuDetailResponseDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.dto.LopDangDayDTO;
import com.nhom26.tutormanagement.dto.YeuCauGiaHanDTO;
import com.nhom26.tutormanagement.entity.BangCap;
import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.entity.TietHoc;
import com.nhom26.tutormanagement.entity.YeuCauGiaHan;
import com.nhom26.tutormanagement.repository.BangCapRepository;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.DanhGiaRepository;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import com.nhom26.tutormanagement.repository.LichSuThanhToanRepository;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.repository.TietHocRepository;
import com.nhom26.tutormanagement.repository.YeuCauGiaHanRepository;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiaSuService {

    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final BangCapRepository bangCapRepository;
    private final TietHocRepository tietHocRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final YeuCauGiaHanRepository yeuCauGiaHanRepository;
    private final LichSuThanhToanRepository lichSuThanhToanRepository;
    private final DangKyHocRepository dangKyHocRepository; // Đã bổ sung repository này
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    // ==========================================
    // 1. LẤY LỊCH RẢNH CỦA GIA SƯ
    // ==========================================
    public List<LichRanhDTO> layLichRanhCuaGiaSu(String idGiaSu) {
        List<LichDay> danhSachLichRanh = lichDayRepository.findByGiaSu_IdGiaSuAndTinhTrangTrue(idGiaSu);
        
        // Loại bỏ trùng lặp dựa trên idTietHoc - chỉ giữ lại LichDay đầu tiên của mỗi TietHoc
        java.util.Map<String, LichDay> uniqueLichDayMap = new java.util.LinkedHashMap<>();
        for (LichDay lichDay : danhSachLichRanh) {
            String idTietHoc = lichDay.getTietHoc().getIdTietHoc();
            if (!uniqueLichDayMap.containsKey(idTietHoc)) {
                uniqueLichDayMap.put(idTietHoc, lichDay);
            }
        }
        
        // Chuyển đổi từ LichDay entity sang LichRanhDTO
        return uniqueLichDayMap.values().stream()
                .map(lichDay -> LichRanhDTO.builder()
                        .idLichDay(lichDay.getIdLichDay())
                        .tinhTrang(lichDay.getTinhTrang())
                        .tietHoc(LichRanhDTO.TietHocDTO.builder()
                                .idTietHoc(lichDay.getTietHoc().getIdTietHoc())
                                .thu(lichDay.getTietHoc().getThu())
                                .gioBatDau(lichDay.getTietHoc().getGioBatDau())
                                .gioKetThuc(lichDay.getTietHoc().getGioKetThuc())
                                .soTiet(lichDay.getTietHoc().getSoTiet())
                                .build())
                        .build())
                .toList();
    }

    // ==========================================
    // 2. TẠO HỒ SƠ GIA SƯ (DÙNG JWT) & LỊCH RẢNH
    // ==========================================
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
            System.out.println("❌ DEBUG: Error in getCurrentMaxLichDayNumber: " + e.getMessage());
            return 0;
        }
    }

    @Transactional
    public String dangKyLichRanh(DangKyLichRanhRequestDTO request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn chưa có hồ sơ Gia sư!"));

        if (request.getDanhSachIdTietHoc() == null || request.getDanhSachIdTietHoc().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất 1 tiết học để đăng ký!");
        }

        int currentLDNumber = getCurrentMaxLichDayNumber();
        int soLuongThemMoi = 0;

        for (String idTietHoc : request.getDanhSachIdTietHoc()) {
            if (lichDayRepository.existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(giaSu.getIdGiaSu(), idTietHoc)) {
                continue; 
            }

            TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Tiết học có ID: " + idTietHoc));

            LichDay lichDayMoi = new LichDay();
            currentLDNumber++;
            lichDayMoi.setIdLichDay(String.format("LD%03d", currentLDNumber));
            lichDayMoi.setTinhTrang(true);
            lichDayMoi.setGiaSu(giaSu);
            lichDayMoi.setTietHoc(tietHoc);

            lichDayRepository.save(lichDayMoi);
            soLuongThemMoi++;
        }

        if (soLuongThemMoi == 0) {
            return "Các tiết học này bạn đã đăng ký rảnh từ trước rồi!";
        }

        return "Đăng ký thành công " + soLuongThemMoi + " lịch rảnh mới!";
    }

    @Transactional
    public GiaSu taoHoSo(GiaSuRequestDTO request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<GiaSu> existingProfile = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername);
        if (existingProfile.isPresent()) {
            throw new RuntimeException("LỖI: Tài khoản của bạn đã có hồ sơ Gia sư!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản!"));

        GiaSu giaSuMoi = new GiaSu();
        giaSuMoi.setIdGiaSu(generateNextIdGiaSu());
        giaSuMoi.setTaiKhoan(taiKhoan);
        giaSuMoi.setTenGiaSu(request.getTenGiaSu());
        giaSuMoi.setSdt(request.getSdt());
        giaSuMoi.setCccd(request.getCccd());
        
        giaSuMoi.setNgay(LocalDateTime.now());
        giaSuMoi.setTrangThai(1); 
        giaSuMoi.setHeSoLuong(1.0);
        giaSuMoi.setLuongHienCon(0.0);

        return giaSuRepository.save(giaSuMoi);
    }

    // ==========================================
    // 3. THÊM BẰNG CẤP GIA SƯ
    // ==========================================
    private String generateNextIdBangCap() {
        String maxId = bangCapRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "BC00001";
        return String.format("BC%05d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }

    @Transactional
    public BangCap themBangCap(BangCapRequestDTO request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn cần tạo hồ sơ Gia sư trước khi thêm bằng cấp!"));

        BangCap bangCapMoi = new BangCap();
        bangCapMoi.setIdBangCap(generateNextIdBangCap());
        bangCapMoi.setGiaSu(giaSu);
        bangCapMoi.setTenBangCap(request.getTenBangCap());
        bangCapMoi.setThongTinBangCap(request.getThongTinBangCap());
        bangCapMoi.setNgayCap(request.getNgayCap());
        bangCapMoi.setAnhMinhChung(request.getAnhMinhChung());
        bangCapMoi.setTrangThai(0); 

        return bangCapRepository.save(bangCapMoi);
    }

    // ==========================================
    // LẤY CHI TIẾT GIA SƯ (CÓ BAO GỒM BẰNG CẤP)
    // ==========================================
    public GiaSuDetailResponseDTO layChiTietGiaSu(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy gia sư!"));

        Double avgRating = danhGiaRepository.calculateAverageRatingForGiaSu(idGiaSu);
        double roundedRating = (avgRating != null) ? Math.round(avgRating * 10.0) / 10.0 : 0.0;

        List<BangCapDTO> bangCapDTOs = bangCapRepository.findByGiaSu_IdGiaSu(idGiaSu).stream()
                .map(bc -> {
                    BangCapDTO bcDTO = new BangCapDTO();
                    bcDTO.setIdBangCap(bc.getIdBangCap());
                    bcDTO.setTenBangCap(bc.getTenBangCap());
                    bcDTO.setThongTinBangCap(bc.getThongTinBangCap());
                    bcDTO.setNgayCap(bc.getNgayCap()); 
                    bcDTO.setAnhMinhChung(bc.getAnhMinhChung());
                    bcDTO.setTrangThai(bc.getTrangThai());
                    return bcDTO;
                }).toList();

        GiaSuDetailResponseDTO dto = new GiaSuDetailResponseDTO();
        dto.setHeSoLuong(giaSu.getHeSoLuong());
        dto.setLuongHienCon(giaSu.getLuongHienCon());
        dto.setIdGiaSu(giaSu.getIdGiaSu());
        dto.setTenGiaSu(giaSu.getTenGiaSu());
        dto.setSdt(giaSu.getSdt());
        dto.setCccd(giaSu.getCccd()); 
        dto.setEmail(giaSu.getTaiKhoan().getEmail());
        dto.setSaoTrungBinh(roundedRating);
        dto.setBangCapList(bangCapDTOs);

        return dto;
    }

    // ==========================================
    // 4. LẤY THÔNG TIN HỒ SƠ GIA SƯ (ĐỂ CẬP NHẬT)
    // ==========================================
    public GiaSuRequestDTO layThongTinGiaSu(String idGiaSu) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy gia sư!"));

        GiaSuRequestDTO dto = new GiaSuRequestDTO();
        dto.setTenGiaSu(giaSu.getTenGiaSu());
        dto.setSdt(giaSu.getSdt());
        dto.setCccd(giaSu.getCccd());

        return dto;
    }

    // ==========================================
    // 5. CẬP NHẬT THÔNG TIN HỒ SƠ GIA SƯ
    // ==========================================
    @Transactional
    public GiaSu capNhatThongTinGiaSu(String idGiaSu, GiaSuRequestDTO request) {
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy gia sư!"));

        if (request.getTenGiaSu() != null && !request.getTenGiaSu().isEmpty()) {
            giaSu.setTenGiaSu(request.getTenGiaSu());
        }
        if (request.getSdt() != null && !request.getSdt().isEmpty()) {
            giaSu.setSdt(request.getSdt());
        }
        if (request.getCccd() != null && !request.getCccd().isEmpty()) {
            giaSu.setCccd(request.getCccd());
        }

        return giaSuRepository.save(giaSu);
    }

    // ==========================================
    // 6. XÓA LỊCH RẢNH
    // ==========================================
    @Transactional
    public String xoaLichRanh(String idLichDay) {
        LichDay lichDay = lichDayRepository.findById(idLichDay)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy lịch rảnh!"));

        lichDayRepository.delete(lichDay);
        return "Xóa lịch rảnh thành công!";
    }

    private String generateNextIdGiaSu() {
        String maxId = giaSuRepository.findMaxId(); 
        if (maxId == null || maxId.trim().isEmpty()) {
            return "GS001";
        }
        int nextNumber = Integer.parseInt(maxId.trim().substring(2)) + 1;
        return String.format("GS%05d", nextNumber);
    }

    // ==========================================
    // LẤY THÔNG TIN HIỆN TẠI
    // ==========================================
    @Transactional
    public GiaSuDetailResponseDTO layThongTinHienTai() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<GiaSu> giaSuOpt = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername);

        GiaSu giaSu;
        if (giaSuOpt.isEmpty()) {
            TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                    .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản người dùng!"));

            GiaSu giaSuMoi = new GiaSu();
            giaSuMoi.setIdGiaSu(generateNextIdGiaSu()); 
            giaSuMoi.setTaiKhoan(taiKhoan);
            giaSu = giaSuRepository.save(giaSuMoi);
        } else {
            giaSu = giaSuOpt.get();
        }

        return layChiTietGiaSu(giaSu.getIdGiaSu());
    }

    // ==========================================
    // XÓA BẰNG CẤP (BẢO MẬT)
    // ==========================================
    @Transactional
    public void xoaBangCap(String idBangCap) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        BangCap bangCap = bangCapRepository.findById(idBangCap)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bằng cấp này!"));

        if (!bangCap.getGiaSu().getTaiKhoan().getTenDangNhap().equals(currentUsername)) {
            throw new RuntimeException("LỖI 403: Bạn không có quyền xóa bằng cấp của người khác!");
        }

        bangCapRepository.delete(bangCap);
    }

    // Lấy tất cả bằng cấp cho admin
    public List<BangCapDTO> layToanBoBangCapChoAdmin() {
        return bangCapRepository.findAllForAdmin().stream()
            .map(bc -> {
                BangCapDTO dto = new BangCapDTO();
                dto.setIdBangCap(bc.getIdBangCap());
                dto.setTenBangCap(bc.getTenBangCap());
                dto.setThongTinBangCap(bc.getThongTinBangCap());
                dto.setNgayCap(bc.getNgayCap());
                dto.setAnhMinhChung(bc.getAnhMinhChung());
                dto.setTrangThai(bc.getTrangThai());
                dto.setIdGiaSu(bc.getGiaSu().getIdGiaSu());
                dto.setTenGiaSu(bc.getGiaSu().getTenGiaSu());
                return dto;
            }).toList();
    }

    // Duyệt hoặc từ chối bằng cấp
    public String duyetBangCap(String idBangCap, Integer trangThai) {
        BangCap bangCap = bangCapRepository.findById(idBangCap)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bằng cấp!"));
        
        bangCap.setTrangThai(trangThai);
        bangCapRepository.save(bangCap);
        
        if (trangThai == 1) return "Đã duyệt bằng cấp thành công!";
        if (trangThai == 2) return "Đã từ chối bằng cấp!";
        return "Đã cập nhật trạng thái!";
    } // Đã thêm dấu } bị thiếu ở đây
        
    // LẤY DANH SÁCH ĐƠN CHỜ DUYỆT
    public List<YeuCauGiaHanDTO> layDonGiaHanChoDuyet() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        List<YeuCauGiaHan> dsDon = yeuCauGiaHanRepository.findByTrangThaiDuyetAndDangKyHoc_KhoaHoc_GiaSu_TaiKhoan_TenDangNhap("Chờ duyệt", currentUsername);

        return dsDon.stream().map(don -> {
            YeuCauGiaHanDTO dto = new YeuCauGiaHanDTO();
            dto.setIdGiaHan(don.getIdGiaHan());
            dto.setIdDangKy(don.getDangKyHoc().getIdDangKy());
            dto.setTenKhoaHoc(don.getDangKyHoc().getKhoaHoc().getTenKhoaHoc());
            dto.setTenHocVien(don.getDangKyHoc().getHocVien().getTenHocVien());
            dto.setSdtPhuHuynh(don.getDangKyHoc().getPhuHuynh().getSdt());
            dto.setSoBuoiGiaHan(don.getSoBuoiGiaHan());
            dto.setLoaiGiaHan(don.getLoaiGiaHan());
            dto.setNgayYeuCau(don.getNgayYeuCau());
            dto.setNgayKetThucCu(don.getDangKyHoc().getNgayKetThucDuKien().toString());
            return dto;
        }).collect(Collectors.toList());
    }

    private String generateNextIdThanhToan() {
        String maxId = lichSuThanhToanRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "TT00001";
        return String.format("TT%05d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }
    public List<LopDangDayDTO> layLopDangDayCuaGiaSu() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("Bạn chưa có hồ sơ Gia sư!"));

        List<DangKyHoc> danhSach = dangKyHocRepository.findByKhoaHoc_GiaSu_IdGiaSu(giaSu.getIdGiaSu());

        return danhSach.stream().map(dk -> LopDangDayDTO.builder()
                .idDangKy(dk.getIdDangKy())
                .idHocVien(dk.getHocVien() != null ? dk.getHocVien().getIdHocVien() : "")
                .tenHocVien(dk.getHocVien() != null ? dk.getHocVien().getTenHocVien() : "N/A")
                .tenPhuHuynh(dk.getPhuHuynh() != null ? dk.getPhuHuynh().getTenPhuHuynh() : "N/A")
                .sdtPhuHuynh(dk.getPhuHuynh() != null ? dk.getPhuHuynh().getSdt() : "N/A")
                .tenKhoaHoc(dk.getKhoaHoc() != null ? dk.getKhoaHoc().getTenKhoaHoc() : "N/A")
                .ngayBatDauHoc(dk.getNgayBatDauHoc() != null ? dk.getNgayBatDauHoc().toString() : null)
                .ngayKetThucDuKien(dk.getNgayKetThucDuKien() != null ? dk.getNgayKetThucDuKien().toString() : null)
                .loaiDangKy(dk.getLoaiDangKy())
                .trangThaiHoanThanh(dk.getTrangThaiHoanThanh())
                .build()
        ).collect(Collectors.toList());
    }
    
    @Transactional
    public String xuLyDonGiaHan(String idGiaHan, boolean isDongY) {
        YeuCauGiaHan don = yeuCauGiaHanRepository.findById(idGiaHan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn yêu cầu!"));

        if (!don.getTrangThaiDuyet().equals("Chờ duyệt")) {
            throw new RuntimeException("Đơn này đã được xử lý trước đó!");
        }

        if (isDongY) {
            don.setTrangThaiDuyet("Chờ thanh toán"); // Đợi học viên trả tiền
            DangKyHoc dk = don.getDangKyHoc();

            // Tính tiền: Tổng tiền / Tổng buổi gốc * Số buổi gia hạn
            double donGiaMotBuoi = dk.getKhoaHoc().getSoTienHoc().doubleValue() / dk.getKhoaHoc().getSoBuoiHoc();
            double tongTienPhaiDong = donGiaMotBuoi * don.getSoBuoiGiaHan();

            // Tạo hóa đơn
            LichSuThanhToan hoaDonMoi = new LichSuThanhToan();
            hoaDonMoi.setIdThanhToan("TT" + System.currentTimeMillis());
            hoaDonMoi.setSoTien(java.math.BigDecimal.valueOf(tongTienPhaiDong));
            hoaDonMoi.setTrangThai("Chưa thanh toán");
            hoaDonMoi.setNgayThanhToan(LocalDateTime.now());
            hoaDonMoi.setDangKyHoc(dk);
            lichSuThanhToanRepository.save(hoaDonMoi);

            // Khóa trạng thái thanh toán của khóa học lại
            dk.setTrangThaiThanhToan(false); 
            dangKyHocRepository.save(dk);
            yeuCauGiaHanRepository.save(don);
            
            return "Đã duyệt đơn! Hệ thống đã tạo hóa đơn, chờ học viên thanh toán.";
        } else {
            don.setTrangThaiDuyet("Từ chối");
            yeuCauGiaHanRepository.save(don);
            return "Đã từ chối đơn gia hạn.";
        }
    }
}