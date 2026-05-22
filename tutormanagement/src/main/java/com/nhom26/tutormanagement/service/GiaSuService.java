package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BangCapDTO;
import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.DangKyLichRanhRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuDetailResponseDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.entity.BangCap;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.entity.TietHoc;
import com.nhom26.tutormanagement.repository.BangCapRepository;
import com.nhom26.tutormanagement.repository.DanhGiaRepository;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import com.nhom26.tutormanagement.repository.TietHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GiaSuService {

    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final BangCapRepository bangCapRepository;
    private final TietHocRepository tietHocRepository;
    private final DanhGiaRepository danhGiaRepository;
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
    // 2. TẠO HỒ SƠ GIA SƯ (DÙNG JWT)
    // ==========================================

    private int getCurrentMaxLichDayNumber() {
        try {
            List<String> allIds = lichDayRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return 0;
            }
            
            // Tìm ID lớn nhất bằng cách parse từng ID
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
    //GIA SƯ TỰ ĐĂNG KÝ LỊCH RẢNH
    @Transactional
    public String dangKyLichRanh(DangKyLichRanhRequestDTO request) {
        // 1. Xác định Gia sư đang thao tác qua JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn chưa có hồ sơ Gia sư!"));

        if (request.getDanhSachIdTietHoc() == null || request.getDanhSachIdTietHoc().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất 1 tiết học để đăng ký!");
        }

        int currentLDNumber = getCurrentMaxLichDayNumber();
        int soLuongThemMoi = 0;

        // 2. Duyệt qua từng tiết học được gửi lên
        for (String idTietHoc : request.getDanhSachIdTietHoc()) {
            
            // Chốt chặn: Nếu Gia sư đã đăng ký Tiết này rồi thì bỏ qua, không tạo trùng
            if (lichDayRepository.existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(giaSu.getIdGiaSu(), idTietHoc)) {
                continue; 
            }

            TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Tiết học có ID: " + idTietHoc));

            LichDay lichDayMoi = new LichDay();
            
            currentLDNumber++;
            lichDayMoi.setIdLichDay(String.format("LD%03d", currentLDNumber));
            lichDayMoi.setTinhTrang(true); // Đánh dấu là đang Rảnh
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
        // Lấy username từ JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Kiểm tra xem đã có hồ sơ chưa
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
        
        // Thiết lập các thông số mặc định cho hệ thống
        giaSuMoi.setNgay(LocalDateTime.now());
        giaSuMoi.setTrangThai(1); // 1 = Đang hoạt động
        giaSuMoi.setHeSoLuong(1.0);
        giaSuMoi.setLuongHienCon(0.0);

        return giaSuRepository.save(giaSuMoi);
    }

    // ==========================================
    // 3. THÊM BẰNG CẤP GIA SƯ (DÙNG JWT)
    // ==========================================
    private String generateNextIdBangCap() {
        String maxId = bangCapRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "BC001";
        return String.format("BC%03d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }

    @Transactional
    public BangCap themBangCap(BangCapRequestDTO request) {
        // Lấy danh tính từ JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Đảm bảo phải có hồ sơ Gia sư rồi mới được nộp bằng
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn cần tạo hồ sơ Gia sư trước khi thêm bằng cấp!"));

        BangCap bangCapMoi = new BangCap();
        bangCapMoi.setIdBangCap(generateNextIdBangCap());
        bangCapMoi.setGiaSu(giaSu);
        bangCapMoi.setTenBangCap(request.getTenBangCap());
        bangCapMoi.setThongTinBangCap(request.getThongTinBangCap());
        bangCapMoi.setNgayCap(request.getNgayCap());
        bangCapMoi.setAnhMinhChung(request.getAnhMinhChung());
        
        // Bằng mới nộp mặc định ở trạng thái false (Chờ Admin duyệt)
        bangCapMoi.setTrangThai(false); 

        return bangCapRepository.save(bangCapMoi);
    }
    // ==========================================
    // LẤY CHI TIẾT GIA SƯ (CÓ BAO GỒM BẰNG CẤP)
    // ==========================================
    public GiaSuDetailResponseDTO layChiTietGiaSu(String idGiaSu) {
        // 1. Tìm thông tin gia sư
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy gia sư!"));

        // 2. Tính số sao trung bình
        Double avgRating = danhGiaRepository.calculateAverageRatingForGiaSu(idGiaSu);
        double roundedRating = (avgRating != null) ? Math.round(avgRating * 10.0) / 10.0 : 0.0;

        // 3. Lấy và Map danh sách Bằng Cấp sang DTO
        List<BangCapDTO> bangCapDTOs = bangCapRepository.findByGiaSu_IdGiaSu(idGiaSu).stream()
                .map(bc -> {
                    BangCapDTO bcDTO = new BangCapDTO();
                    bcDTO.setIdBangCap(bc.getIdBangCap());
                    bcDTO.setTenBangCap(bc.getTenBangCap());
                    bcDTO.setThongTinBangCap(bc.getThongTinBangCap());
                    bcDTO.setNgayCap(bc.getNgayCap()); // Có thể cần ép kiểu nếu lệch Date/LocalDateTime
                    bcDTO.setAnhMinhChung(bc.getAnhMinhChung());
                    bcDTO.setTrangThai(bc.getTrangThai());
                    return bcDTO;
                }).toList();

        // 4. Đổ dữ liệu vào DTO
        GiaSuDetailResponseDTO dto = new GiaSuDetailResponseDTO();
        dto.setHeSoLuong(giaSu.getHeSoLuong());
        dto.setLuongHienCon(giaSu.getLuongHienCon());
        dto.setIdGiaSu(giaSu.getIdGiaSu());
        dto.setTenGiaSu(giaSu.getTenGiaSu());
        dto.setSdt(giaSu.getSdt());
        dto.setCccd(giaSu.getCccd()); // Map CCCD
        dto.setEmail(giaSu.getTaiKhoan().getEmail());
        dto.setSaoTrungBinh(roundedRating);
        
        // Gán mảng object Bằng Cấp vào DTO
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
            return String.format("GS%03d", nextNumber);
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

        // QUAN TRỌNG: Gọi lại hàm layChiTietGiaSu để trả về DTO thay vì trả về Entity thô
        // Điều này đảm bảo Frontend luôn nhận được cấu trúc JSON { ..., bangCapList: [...] }
        return layChiTietGiaSu(giaSu.getIdGiaSu());
    }
    // ==========================================
    // XÓA BẰNG CẤP (BẢO MẬT)
    // ==========================================
    @Transactional
    public void xoaBangCap(String idBangCap) {
        // Lấy thông tin người đang đăng nhập
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        BangCap bangCap = bangCapRepository.findById(idBangCap)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bằng cấp này!"));

        // Chốt chặn bảo mật: Đảm bảo gia sư chỉ được xóa bằng cấp của chính mình
        if (!bangCap.getGiaSu().getTaiKhoan().getTenDangNhap().equals(currentUsername)) {
            throw new RuntimeException("LỖI 403: Bạn không có quyền xóa bằng cấp của người khác!");
        }

        bangCapRepository.delete(bangCap);
    }
}