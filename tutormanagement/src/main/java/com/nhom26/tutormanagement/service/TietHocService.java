package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.TietHocRequestDTO;
import com.nhom26.tutormanagement.entity.TietHoc;
import com.nhom26.tutormanagement.repository.TietHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TietHocService {

    private final TietHocRepository tietHocRepository;

    // ==========================================
    // TẠO TIẾT HỌC MỚI (ĐỘNG)
    // ==========================================
    @Transactional
    public TietHoc taoTietHocMoi(TietHocRequestDTO request) {
        // Validate input
        if (request.getThu() == null || request.getThu().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn thứ!");
        }
        if (request.getGioBatDau() == null || request.getGioBatDau().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập giờ bắt đầu!");
        }
        if (request.getGioKetThuc() == null || request.getGioKetThuc().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập giờ kết thúc!");
        }

        try {
            String gioBatDauStr = request.getGioBatDau().trim();
            String gioKetThucStr = request.getGioKetThuc().trim();
            
            System.out.println("📝 DEBUG: gioBatDau = '" + gioBatDauStr + "' (length=" + gioBatDauStr.length() + ")");
            System.out.println("📝 DEBUG: gioKetThuc = '" + gioKetThucStr + "' (length=" + gioKetThucStr.length() + ")");
            
            // Parse giờ bắt đầu và giờ kết thúc (định dạng: "HH:mm")
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime startTime = LocalTime.parse(gioBatDauStr, timeFormatter);
            LocalTime endTime = LocalTime.parse(gioKetThucStr, timeFormatter);

            System.out.println("✅ DEBUG: startTime = " + startTime + ", endTime = " + endTime);

            // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
            if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
                throw new RuntimeException("Giờ kết thúc phải sau giờ bắt đầu!");
            }

            // Tính số tiết (55 phút = 1 tiết)
            long minutesDifference = java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
            int soTiet = (int) Math.ceil(minutesDifference / 55.0);

            System.out.println("📝 DEBUG: minutesDifference = " + minutesDifference + ", soTiet = " + soTiet);

            if (soTiet <= 0) {
                throw new RuntimeException("Khoảng thời gian phải ít nhất 55 phút (1 tiết)!");
            }

            // Tạo ID mới cho TietHoc
            String newId = generateNextIdTietHoc();

            // Tạo LocalDateTime từ LocalTime (sử dụng ngày mặc định)
            LocalDateTime gioBatDauDateTime = LocalDateTime.of(2024, 1, 1, startTime.getHour(), startTime.getMinute());
            LocalDateTime gioKetThucDateTime = LocalDateTime.of(2024, 1, 1, endTime.getHour(), endTime.getMinute());

            // Tạo entity TietHoc
            TietHoc tietHoc = new TietHoc();
            tietHoc.setIdTietHoc(newId);
            tietHoc.setThu(request.getThu());
            tietHoc.setGioBatDau(gioBatDauDateTime);
            tietHoc.setGioKetThuc(gioKetThucDateTime);
            tietHoc.setSoTiet(soTiet);

            System.out.println("✅ DEBUG: TietHoc created: " + newId);
            return tietHocRepository.save(tietHoc);

        } catch (java.time.format.DateTimeParseException e) {
            System.out.println("❌ DEBUG: DateTimeParseException = " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi định dạng giờ! Vui lòng sử dụng định dạng HH:mm (VD: 17:30). Chi tiết: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Exception = " + e.getMessage());
            e.printStackTrace();
            if (e.getMessage().contains("Vui lòng") || e.getMessage().contains("Giờ") || e.getMessage().contains("Khoảng")) {
                throw e;
            }
            throw new RuntimeException("Lỗi định dạng giờ! Vui lòng sử dụng định dạng HH:mm (VD: 17:30). Chi tiết: " + e.getMessage());
        }
    }

    // ==========================================
    // CẬP NHẬT TIẾT HỌC
    // ==========================================
    @Transactional
    public TietHoc capNhatTietHoc(String idTietHoc, TietHocRequestDTO request) {
        TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiết học!"));

        try {
            String gioBatDauStr = request.getGioBatDau().trim();
            String gioKetThucStr = request.getGioKetThuc().trim();
            
            // Parse giờ bắt đầu và giờ kết thúc (định dạng: "HH:mm")
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime startTime = LocalTime.parse(gioBatDauStr, timeFormatter);
            LocalTime endTime = LocalTime.parse(gioKetThucStr, timeFormatter);

            // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
            if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
                throw new RuntimeException("Giờ kết thúc phải sau giờ bắt đầu!");
            }

            // Tính số tiết (55 phút = 1 tiết)
            long minutesDifference = java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
            int soTiet = (int) Math.ceil(minutesDifference / 55.0);

            if (soTiet <= 0) {
                throw new RuntimeException("Khoảng thời gian phải ít nhất 55 phút (1 tiết)!");
            }

            // Cập nhật thông tin
            tietHoc.setThu(request.getThu());
            tietHoc.setGioBatDau(LocalDateTime.of(2024, 1, 1, startTime.getHour(), startTime.getMinute()));
            tietHoc.setGioKetThuc(LocalDateTime.of(2024, 1, 1, endTime.getHour(), endTime.getMinute()));
            tietHoc.setSoTiet(soTiet);

            return tietHocRepository.save(tietHoc);

        } catch (java.time.format.DateTimeParseException e) {
            throw new RuntimeException("Lỗi định dạng giờ! Vui lòng sử dụng định dạng HH:mm (VD: 17:30)");
        } catch (Exception e) {
            if (e.getMessage().contains("Vui lòng") || e.getMessage().contains("Giờ") || e.getMessage().contains("Khoảng")) {
                throw e;
            }
            throw new RuntimeException("Lỗi cập nhật tiết học: " + e.getMessage());
        }
    }
    private String generateNextIdTietHoc() {
        try {
            List<String> allIds = tietHocRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return "TH001";
            }
            
            // Tìm ID lớn nhất bằng cách parse từng ID
            int maxNumber = 0;
            for (String id : allIds) {
                try {
                    String trimmedId = id.trim();
                    if (trimmedId.startsWith("TH") && trimmedId.length() >= 5) {
                        int number = Integer.parseInt(trimmedId.substring(2, 5));
                        if (number > maxNumber) {
                            maxNumber = number;
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid IDs
                }
            }
            
            return String.format("TH%03d", maxNumber + 1);
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error in generateNextIdTietHoc: " + e.getMessage());
            return "TH001";
        }
    }
    public List<TietHoc> getAllTietHoc() {
        // Lấy tất cả Tiết học từ Database trả về cho Frontend
        return tietHocRepository.findAll();
    }
}
