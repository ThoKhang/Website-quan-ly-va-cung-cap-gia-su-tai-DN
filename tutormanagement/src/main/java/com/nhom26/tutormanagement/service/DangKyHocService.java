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

import java.time.LocalDate;
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
                .ngayKetThucDuKien(dangKyHoc.getNgayKetThucDuKien())
                .ngayGiaHan(dangKyHoc.getNgayGiaHan())
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
     * Lấy chi tiết một khóa học đã đăng ký (bao gồm cả khi chưa có lịch học)
     */
    public DangKyHocResponseDTO layChiTietDangKyHoc(String idDangKy) {
        DangKyHoc dangKyHoc = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học đã đăng ký"));

        return mapToResponseDTO(dangKyHoc);
    }

    /**
     * Gia hạn khóa học (tạo đơn đăng ký mới với cùng số buổi, trạng thái "Chờ duyệt")
     * Nếu khóa học đã được gia hạn rồi, chỉ cập nhật ngày bắt đầu mới
     * @param idDangKy ID của đơn đăng ký cũ
     * @param ngayBatDauMoi Ngày bắt đầu mới do phụ huynh chọn
     */
    public String giaHanKhoaHoc(String idDangKy, LocalDate ngayBatDauMoi) {
        DangKyHoc dangKyHocCu = dangKyHocRepository.findById(idDangKy)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học đã đăng ký"));

        // Kiểm tra xem khóa học có đang học không
        LocalDate today = LocalDate.now();
        LocalDate endDate = dangKyHocCu.getNgayKetThucDuKien();
        
        if (endDate == null) {
            throw new RuntimeException("Khóa học chưa có ngày kết thúc dự kiến");
        }

        // Kiểm tra điều kiện: chỉ gia hạn khi còn lại <= 15 ngày
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, endDate);
        if (daysRemaining > 15) {
            throw new RuntimeException("Chỉ có thể gia hạn trong 15 ngày trước khi kết thúc khóa học");
        }

        // Kiểm tra ngày bắt đầu mới hợp lệ
        if (ngayBatDauMoi == null) {
            throw new RuntimeException("Ngày bắt đầu mới không được để trống");
        }
        
        if (ngayBatDauMoi.isBefore(endDate.plusDays(1))) {
            throw new RuntimeException("Ngày bắt đầu mới phải sau ngày kết thúc khóa học cũ (" + endDate + ")");
        }

        // KIỂM TRA: Nếu khóa học đã được gia hạn rồi, chỉ cập nhật ngày bắt đầu
        if (dangKyHocCu.getNgayGiaHan() != null) {
            // Khóa học đã được gia hạn trước đó, chỉ cập nhật ngày bắt đầu
            dangKyHocCu.setNgayBatDauHoc(ngayBatDauMoi);
            
            // Tính lại ngày kết thúc
            List<ChiTietLichHoc> chiTietList = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(idDangKy);
            int soBuoi = chiTietList.size();
            int soTuan = (soBuoi + 1) / 2;
            LocalDate newEndDate = ngayBatDauMoi.plusDays(soTuan * 7L);
            dangKyHocCu.setNgayKetThucDuKien(newEndDate);
            
            // Cập nhật lại ngày học cho các chi tiết lịch học
            LocalDate currentDate = ngayBatDauMoi;
            for (int i = 0; i < soBuoi && currentDate.isBefore(newEndDate.plusDays(1)); i++) {
                if (i < chiTietList.size()) {
                    ChiTietLichHoc chiTiet = chiTietList.get(i);
                    chiTiet.setNgayHoc(currentDate.atStartOfDay());
                    chiTietLichHocRepository.save(chiTiet);
                }
                currentDate = currentDate.plusDays(1);
            }
            
            dangKyHocRepository.save(dangKyHocCu);
            return "Cập nhật ngày học thành công. Ngày bắt đầu: " + ngayBatDauMoi + ". Ngày kết thúc: " + newEndDate;
        }

        // Tạo đơn đăng ký mới
        DangKyHoc dangKyHocMoi = new DangKyHoc();
        
        // Generate ID mới
        String maxId = dangKyHocRepository.findMaxId();
        String newId;
        if (maxId == null || maxId.trim().isEmpty()) {
            newId = "DK00001";
        } else {
            try {
                int nextNumber = Integer.parseInt(maxId.trim().substring(2)) + 1;
                newId = String.format("DK%05d", nextNumber);
            } catch (Exception e) {
                newId = "DK00001";
            }
        }
        
        // Copy thông tin từ đơn cũ
        dangKyHocMoi.setIdDangKy(newId);
        dangKyHocMoi.setPhuHuynh(dangKyHocCu.getPhuHuynh());
        dangKyHocMoi.setHocVien(dangKyHocCu.getHocVien());
        dangKyHocMoi.setKhoaHoc(dangKyHocCu.getKhoaHoc());
        dangKyHocMoi.setNgayDangKy(java.time.LocalDateTime.now());
        dangKyHocMoi.setLoaiDangKy(dangKyHocCu.getLoaiDangKy());
        dangKyHocMoi.setTrangThaiThanhToan(true); // Đã thanh toán
        dangKyHocMoi.setTrangThaiHoanThanh(false); // Chưa hoàn thành
        
        // Sử dụng ngày bắt đầu do phụ huynh chọn
        LocalDate newStartDate = ngayBatDauMoi;
        dangKyHocMoi.setNgayBatDauHoc(newStartDate);
        
        // Lấy số buổi từ khóa cũ
        List<ChiTietLichHoc> chiTietCuList = chiTietLichHocRepository.findByDangKyHoc_IdDangKy(idDangKy);
        int soBuoi = chiTietCuList.size();
        
        // Tính số tuần (1 tuần 2 buổi)
        int soTuan = (soBuoi + 1) / 2; // Làm tròn lên
        
        // Ngày kết thúc mới = ngày bắt đầu mới + (số tuần * 7 ngày)
        LocalDate newEndDate = newStartDate.plusDays(soTuan * 7L);
        dangKyHocMoi.setNgayKetThucDuKien(newEndDate);
        
        dangKyHocMoi.setNgayGiaHan(today);

        // Lưu đơn đăng ký mới
        dangKyHocRepository.save(dangKyHocMoi);
        
        // CẬP NHẬT: Đánh dấu khóa học cũ là đã gia hạn (set ngayGiaHan trên record gốc)
        dangKyHocCu.setNgayGiaHan(today);
        dangKyHocRepository.save(dangKyHocCu);
        
        // Tạo lại lịch học cho khóa mới (copy từ khóa cũ)
        if (!chiTietCuList.isEmpty()) {
            LocalDate currentDate = newStartDate;
            for (int i = 0; i < soBuoi && currentDate.isBefore(newEndDate.plusDays(1)); i++) {
                ChiTietLichHoc chiTietMoi = new ChiTietLichHoc();
                
                // Generate ID mới
                String maxCtId = chiTietLichHocRepository.findMaxId();
                String newCtId;
                if (maxCtId == null || maxCtId.trim().isEmpty()) {
                    newCtId = "CT00001";
                } else {
                    try {
                        int nextNumber = Integer.parseInt(maxCtId.trim().substring(2)) + 1;
                        newCtId = String.format("CT%05d", nextNumber);
                    } catch (Exception e) {
                        newCtId = "CT00001";
                    }
                }
                
                chiTietMoi.setIdLichHoc(newCtId);
                chiTietMoi.setDangKyHoc(dangKyHocMoi);
                chiTietMoi.setLichDay(chiTietCuList.get(i).getLichDay()); // Cùng lịch dạy
                chiTietMoi.setNgayHoc(currentDate.atStartOfDay());
                chiTietMoi.setTinhTrang("Chưa bắt đầu");
                
                chiTietLichHocRepository.save(chiTietMoi);
                
                // Tăng ngày lên 1 ngày
                currentDate = currentDate.plusDays(1);
            }
        }
        
        return "Gia hạn khóa học thành công. Đơn đăng ký mới: " + newId + " (Chờ duyệt). Ngày bắt đầu: " + newStartDate + ". Ngày kết thúc: " + newEndDate;
    }
}
