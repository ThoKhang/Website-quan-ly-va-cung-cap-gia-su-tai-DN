package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ChiTietLichHocResponseDTO;
import com.nhom26.tutormanagement.dto.DangKyHocResponseDTO;
import com.nhom26.tutormanagement.dto.KhoaHocResponseDTO;
import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.dto.YeuCauGiaHanDTO;
import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import com.nhom26.tutormanagement.entity.DangKyHoc;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import com.nhom26.tutormanagement.entity.YeuCauGiaHan;
import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import com.nhom26.tutormanagement.repository.DangKyHocRepository;
import com.nhom26.tutormanagement.repository.LichSuThanhToanRepository;
import com.nhom26.tutormanagement.repository.YeuCauGiaHanRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DangKyHocService {

    private final DangKyHocRepository dangKyHocRepository;
    private final ChiTietLichHocRepository chiTietLichHocRepository;
    private final KhoaHocService khoaHocService;
    private final YeuCauGiaHanRepository yeuCauGiaHanRepository; // Inject thêm Repo này
    private final LichSuThanhToanRepository lichSuThanhToanRepository;
    /**
     * Lấy danh sách khóa học đã đăng ký của phụ huynh (Lịch sử)
     */
    public List<DangKyHocResponseDTO> layLichSuKhoaHoc(String idPhuHuynh) {
        List<DangKyHoc> danhSachDangKy = dangKyHocRepository.findByPhuHuynh_IdPhuHuynhOrderByNgayDangKyDesc(idPhuHuynh);

        return danhSachDangKy.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    private int convertThuToDayOfWeek(String thuStr) {
        if (thuStr == null) return -1;
        
        String t = thuStr.toLowerCase().trim();
        if (t.contains("2")) return 1; // Monday trong Java là 1
        if (t.contains("3")) return 2;
        if (t.contains("4")) return 3;
        if (t.contains("5")) return 4;
        if (t.contains("6")) return 5;
        if (t.contains("7")) return 6;
        if (t.contains("chủ nhật") || t.contains("cn")) return 7; // Sunday trong Java là 7
        
        return -1; // Không hợp lệ
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

        // ✅ THÊM: Lấy đơn gia hạn mới nhất
        DangKyHocResponseDTO.DangKyHocResponseDTOBuilder builder = DangKyHocResponseDTO.builder()
                .idDangKy(dangKyHoc.getIdDangKy())
                .khoaHoc(khoaHocDTO)
                .ngayDangKy(dangKyHoc.getNgayDangKy())
                .ngayBatDauHoc(dangKyHoc.getNgayBatDauHoc())
                .ngayKetThucDuKien(dangKyHoc.getNgayKetThucDuKien())
                .trangThaiThanhToan(dangKyHoc.getTrangThaiThanhToan())
                .trangThaiHoanThanh(dangKyHoc.getTrangThaiHoanThanh())
                .chiTietLichHoc(chiTietDTOList);

        // ✅ Map thông tin đơn gia hạn mới nhất vào DTO
        yeuCauGiaHanRepository
            .findTopByDangKyHoc_IdDangKyOrderByNgayYeuCauDesc(dangKyHoc.getIdDangKy())
            .ifPresent(don -> {
                builder.idYeuCauGiaHan(don.getIdGiaHan());
                builder.trangThaiGiaHan(don.getTrangThaiDuyet());
                builder.soBuoiGiaHan(don.getSoBuoiGiaHan());
                builder.loaiGiaHan(don.getLoaiGiaHan());
            });

        return builder.build();
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
    @Transactional
    public String guiYeuCauGiaHan(String idDangKy, Integer soBuoiGiaHan, String loaiGiaHan) {
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học đang đăng ký!"));

        boolean daCoDonCho = yeuCauGiaHanRepository.existsByDangKyHoc_IdDangKyAndTrangThaiDuyet(idDangKy, "Chờ duyệt");
        if (daCoDonCho) {
            throw new RuntimeException("Bạn đã có một yêu cầu gia hạn đang chờ Gia sư phê duyệt!");
        }

        YeuCauGiaHan yeuCauMoi = new YeuCauGiaHan();
        yeuCauMoi.setIdGiaHan(generateNextIdGiaHan());
        yeuCauMoi.setDangKyHoc(dangKyHoc);
        yeuCauMoi.setLoaiGiaHan(loaiGiaHan); 
        
        // LOGIC: Nếu là "Toàn bộ", lấy tổng số buổi gốc. Nếu "Tùy chọn", lấy số buổi user nhập
        if ("Toàn bộ".equalsIgnoreCase(loaiGiaHan)) {
            yeuCauMoi.setSoBuoiGiaHan(dangKyHoc.getKhoaHoc().getSoBuoiHoc());
        } else {
            if (soBuoiGiaHan == null || soBuoiGiaHan <= 0) {
                throw new RuntimeException("Vui lòng nhập số buổi gia hạn hợp lệ!");
            }
            yeuCauMoi.setSoBuoiGiaHan(soBuoiGiaHan);
        }

        yeuCauMoi.setNgayYeuCau(LocalDateTime.now());
        yeuCauMoi.setTrangThaiDuyet("Chờ duyệt");

        yeuCauGiaHanRepository.save(yeuCauMoi);
        return "Đã gửi yêu cầu gia hạn " + yeuCauMoi.getSoBuoiGiaHan() + " buổi. Vui lòng chờ Gia sư xác nhận!";
    }
    @Transactional
    public String xacNhanThanhToanGiaHan(String idGiaHan) {
        YeuCauGiaHan don = yeuCauGiaHanRepository.findById(idGiaHan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn yêu cầu!"));

        if (!don.getTrangThaiDuyet().equals("Chờ thanh toán")) {
            throw new RuntimeException("Đơn gia hạn không ở trạng thái chờ thanh toán!");
        }

        DangKyHoc dk = don.getDangKyHoc();

        // 1. Cập nhật trạng thái
        don.setTrangThaiDuyet("Đã hoàn thành");
        dk.setTrangThaiThanhToan(true);

        // 2. Tìm hóa đơn chưa thanh toán của Đăng ký này và chuyển thành Đã thanh toán
        // ✅ Chỉ lấy hóa đơn của đơn đăng ký này
        List<LichSuThanhToan> dsHoaDon = lichSuThanhToanRepository
            .findChuaThanhToanByDangKy(dk.getIdDangKy());
            for (LichSuThanhToan hd : dsHoaDon) {
                hd.setTrangThai("Đã thanh toán");
                hd.setNgayThanhToan(LocalDateTime.now());
                lichSuThanhToanRepository.save(hd);
            }

        // 3. TỰ ĐỘNG RẢI LỊCH MỚI
        List<ChiTietLichHoc> lichHocCu = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(dk.getIdDangKy());
        if (lichHocCu.isEmpty()) throw new RuntimeException("Không tìm thấy dữ liệu lịch học cũ để làm cơ sở gia hạn.");

        // --- ĐÃ SỬA LỖI TẠI ĐÂY ---
        Map<Integer, LichDay> thuToLichDayMap = new java.util.HashMap<>();
        for (ChiTietLichHoc ct : lichHocCu) {
            String thuStr = ct.getLichDay().getTietHoc().getThu(); // Lấy chuỗi "Thứ 2"
            int thuConverted = convertThuToDayOfWeek(thuStr);      // Dịch sang số 1 (Monday)
            
            if (thuConverted != -1) {
                thuToLichDayMap.put(thuConverted, ct.getLichDay());
            }
        }
        // ---------------------------

        // Lấy ngày bắt đầu chạy = Ngày kết thúc dự kiến cũ + 1 ngày
        LocalDate ngayChay = dk.getNgayKetThucDuKien().plusDays(1);
        int soBuoiGiaHan = don.getSoBuoiGiaHan();
        int soBuoiDaTao = 0;
        
        // Lấy ID chi tiết lịch học lớn nhất hiện tại
        String maxId = chiTietLichHocRepository.findMaxId();
        int currentLHNumber = (maxId == null || maxId.trim().isEmpty()) ? 0 
            : (int) Long.parseLong(maxId.trim().substring(2)); 
        while (soBuoiDaTao < soBuoiGiaHan) {
            int currentThu = ngayChay.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday

            if (thuToLichDayMap.containsKey(currentThu)) { 
                LichDay lichDayHomNay = thuToLichDayMap.get(currentThu);

                currentLHNumber++;
                ChiTietLichHoc chiTiet = new ChiTietLichHoc();
                chiTiet.setIdLichHoc(String.format("LH%05d", currentLHNumber));
                chiTiet.setDangKyHoc(dk);
                chiTiet.setLichDay(lichDayHomNay);
                chiTiet.setTinhTrang("Chưa bắt đầu");
                
                java.time.LocalTime gioBatDauTietHoc = lichDayHomNay.getTietHoc().getGioBatDau().toLocalTime();
                LocalDateTime thoiGianHocChinhXac = LocalDateTime.of(ngayChay, gioBatDauTietHoc);
                
                chiTiet.setNgayHoc(thoiGianHocChinhXac); 
                chiTietLichHocRepository.save(chiTiet);
                
                soBuoiDaTao++;
            }
            
            if (soBuoiDaTao < soBuoiGiaHan) {
                ngayChay = ngayChay.plusDays(1);
            }
        }

        // 4. Chốt ngày kết thúc dự kiến mới
        dk.setNgayKetThucDuKien(ngayChay);
        dangKyHocRepository.save(dk);
        yeuCauGiaHanRepository.save(don);

        return "Thanh toán thành công! Đã tự động tạo thêm " + soBuoiGiaHan + " buổi học mới. Khóa học gia hạn đến ngày " + ngayChay;
    }
    // Lấy đơn gia hạn hiện tại
    public YeuCauGiaHanDTO layDonGiaHanHienTai(String idDangKy) {
        return yeuCauGiaHanRepository
            .findTopByDangKyHoc_IdDangKyOrderByNgayYeuCauDesc(idDangKy)
            .map(don -> {
                YeuCauGiaHanDTO dto = new YeuCauGiaHanDTO();
                dto.setIdGiaHan(don.getIdGiaHan());
                dto.setIdDangKy(don.getDangKyHoc().getIdDangKy());
                dto.setSoBuoiGiaHan(don.getSoBuoiGiaHan());
                dto.setLoaiGiaHan(don.getLoaiGiaHan());
                dto.setTrangThai(don.getTrangThaiDuyet()); // map sang trangThai
                dto.setNgayYeuCau(don.getNgayYeuCau());
                return dto;
            })
            .orElseThrow(() -> new RuntimeException("Chưa có đơn gia hạn nào!"));
    }
    private String generateNextIdGiaHan() {
        String maxId = yeuCauGiaHanRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "GH00001";
        return String.format("GH%05d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }
    @Transactional
    public String huyYeuCauGiaHan(String idGiaHan) {
        YeuCauGiaHan don = yeuCauGiaHanRepository.findById(idGiaHan)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn!"));

        if (!don.getTrangThaiDuyet().equals("Chờ thanh toán")) {
            throw new RuntimeException("Chỉ có thể hủy đơn đang chờ thanh toán!");
        }

        // Khôi phục trạng thái thanh toán
        DangKyHoc dk = don.getDangKyHoc();
        dk.setTrangThaiThanhToan(true);
        dangKyHocRepository.save(dk);

        don.setTrangThaiDuyet("Đã hủy");
        yeuCauGiaHanRepository.save(don);

        return "Đã hủy yêu cầu gia hạn.";
    }
}