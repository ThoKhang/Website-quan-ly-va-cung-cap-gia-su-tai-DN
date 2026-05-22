package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.ClassStatsResponseDTO;
import com.nhom26.tutormanagement.dto.RevenueResponseDTO;
import com.nhom26.tutormanagement.repository.DangKyHocRepository; // ĐỔI IMPORT NÀY
import com.nhom26.tutormanagement.repository.LichSuThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    // ĐỔI REPOSITORY NÀY
    private final DangKyHocRepository dangKyHocRepository;
    private final LichSuThanhToanRepository lichSuThanhToanRepository;
    public List<ClassStatsResponseDTO> getThongKeTheoThang() {
        int currentYear = Year.now().getValue(); 
        
        // Gọi DB lấy dữ liệu từ bảng DangKyHoc
        List<Object[]> rawData = dangKyHocRepository.thongKeDangKyTheoThang(currentYear);
        
        Map<Integer, ClassStatsResponseDTO> statsMap = rawData.stream().collect(Collectors.toMap(
            row -> ((Number) row[0]).intValue(), 
            row -> new ClassStatsResponseDTO(
                "Tháng " + row[0] + "/" + currentYear,
                ((Number) row[1]).intValue(), 
                ((Number) row[2]).intValue(), 
                ((Number) row[3]).intValue(), 
                ((Number) row[4]).intValue()  
            )
        ));

        List<ClassStatsResponseDTO> result = new ArrayList<>();
        int currentMonth = java.time.LocalDate.now().getMonthValue(); 
        
        for (int i = 1; i <= Math.max(6, currentMonth); i++) {
            if (statsMap.containsKey(i)) {
                result.add(statsMap.get(i));
            } else {
                result.add(new ClassStatsResponseDTO("Tháng " + i + "/" + currentYear, 0, 0, 0, 0));
            }
        }

        return result;
    }
    public List<RevenueResponseDTO> getDoanhThuTheoThang() {
        int currentYear = Year.now().getValue();
        
        List<Object[]> rawData = lichSuThanhToanRepository.thongKeDoanhThuTheoThang(currentYear);
        
        // Chuyển kết quả sang Map
        Map<Integer, RevenueResponseDTO> statsMap = rawData.stream().collect(Collectors.toMap(
            row -> ((Number) row[0]).intValue(), // Tháng
            row -> new RevenueResponseDTO(
                "Tháng " + row[0] + "/" + currentYear,
                row[1] != null ? ((Number) row[1]).doubleValue() : 0.0, // Doanh thu
                row[2] != null ? ((Number) row[2]).intValue() : 0       // Số lớp
            )
        ));

        List<RevenueResponseDTO> result = new ArrayList<>();
        int currentMonth = java.time.LocalDate.now().getMonthValue();
        
        // Lấy từ tháng 1 đến tháng hiện tại (hoặc cố định 6 tháng)
        for (int i = 1; i <= Math.max(6, currentMonth); i++) {
            if (statsMap.containsKey(i)) {
                result.add(statsMap.get(i));
            } else {
                result.add(new RevenueResponseDTO("Tháng " + i + "/" + currentYear, 0.0, 0));
            }
        }

        return result;
    }
}