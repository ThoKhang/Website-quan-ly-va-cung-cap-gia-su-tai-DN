/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 *
 * @author Tho Khang
 */
@Service
@RequiredArgsConstructor
public class LichDayService {
    private final LichDayRepository lichDayRepository;

    private String generateNextId() {
        String maxId = lichDayRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "LD001";
        }
        String cleanId = maxId.trim();
        int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
        return String.format("LD%03d", nextNumber);
    }

    public LichDay save(LichDay lichDay) {
        if (lichDay.getIdLichDay() == null || lichDay.getIdLichDay().isEmpty()) {
            lichDay.setIdLichDay(generateNextId());
        }
        return lichDayRepository.save(lichDay);
    }
    
    /**
     * NGHIỆP VỤ CHÍNH: Đăng ký lịch rảnh cho Gia sư
     */
    @Transactional
    public void dangKyLichRanhHàngLoat(LichDayRequestDTO request) {
        // 1. Kiểm tra sự tồn tại của Gia sư
        GiaSu giaSu = giaSuRepository.findById(request.getIdGiaSu())
                .orElseThrow(() -> new RuntimeException("Gia sư không tồn tại với ID: " + request.getIdGiaSu()));

        // 2. Duyệt qua danh sách ID tiết học rảnh từ DTO
        for (String idTietHoc : request.getDanhSachIdTietHoc()) {
            
            // KIỂM TRA CHỐNG TRÙNG: Chỉ tạo lịch nếu khung giờ này gia sư chưa đăng ký trước đó
            boolean isExist = lichDayRepository.existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(
                    giaSu.getIdGiaSu(), idTietHoc);

            if (!isExist) {
                TietHoc tietHoc = tietHocRepository.findById(idTietHoc)
                        .orElseThrow(() -> new RuntimeException("Tiết học không tồn tại: " + idTietHoc));

                // 3. Khởi tạo thực thể LichDay mới
                LichDay lichDay = new LichDay();
                lichDay.setIdLichDay(generateNextId());
                lichDay.setGiaSu(giaSu);
                lichDay.setTietHoc(tietHoc);
                
                // Thiết lập tinhTrang = true (Rảnh/Trống) để Phụ huynh có thể tìm thấy [1]
                lichDay.setTinhTrang(true); 

                // 4. Lưu vào cơ sở dữ liệu
                lichDayRepository.save(lichDay);
            }
        }
    }
}