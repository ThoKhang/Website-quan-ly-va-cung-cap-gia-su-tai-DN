package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.LichRanhDTO;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 *
 * @author Tho Khang
 */
@Service
@RequiredArgsConstructor
public class LichDayService {
    private final LichDayRepository lichDayRepository;

    private String generateNextId() {
        try {
            List<String> allIds = lichDayRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return "LD001";
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
            
            return String.format("LD%03d", maxNumber + 1);
        } catch (Exception e) {
            return "LD001";
        }
    }

    public LichDay save(LichDay lichDay) {
        if (lichDay.getIdLichDay() == null || lichDay.getIdLichDay().isEmpty()) {
            lichDay.setIdLichDay(generateNextId());
        }
        return lichDayRepository.save(lichDay);
    }

    // ==========================================
    // LẤY DANH SÁCH LỊCH RẢNH VÀ THÔNG TIN LỚP HỌC
    // ==========================================
    public List<LichRanhDTO> getLichRanhCuaGiaSu(String idGiaSu) {
        // 1. Lấy tất cả lịch dạy của Gia sư này từ DB
        List<LichDay> danhSachLichDay = lichDayRepository.findByGiaSu_IdGiaSu(idGiaSu);

        // 2. Chuyển đổi từ Entity sang DTO
        return danhSachLichDay.stream().map(lichDay -> {
            LichRanhDTO dto = new LichRanhDTO();
            dto.setIdLichDay(lichDay.getIdLichDay());
            dto.setTinhTrang(lichDay.getTinhTrang());

            // Đắp dữ liệu Tiết học
            if (lichDay.getTietHoc() != null) {
                LichRanhDTO.TietHocDTO tietHocDTO = new LichRanhDTO.TietHocDTO();
                tietHocDTO.setIdTietHoc(lichDay.getTietHoc().getIdTietHoc());
                tietHocDTO.setThu(lichDay.getTietHoc().getThu());
                tietHocDTO.setGioBatDau(lichDay.getTietHoc().getGioBatDau());
                tietHocDTO.setGioKetThuc(lichDay.getTietHoc().getGioKetThuc());
                tietHocDTO.setSoTiet(lichDay.getTietHoc().getSoTiet());
                dto.setTietHoc(tietHocDTO);
            }

            //NẾU ĐÃ ĐƯỢC ĐĂNG KÝ (tinhTrang == false)
            if (Boolean.FALSE.equals(lichDay.getTinhTrang())) {
                // Gọi câu query trong Repository để lấy thông tin chi tiết
                List<Object[]> thongTinList = lichDayRepository.findThongTinLopHocByIdLichDay(lichDay.getIdLichDay());
                
                if (thongTinList != null && !thongTinList.isEmpty()) {
                    Object[] thongTin = thongTinList.get(0); // Lấy dòng đầu tiên khớp với lịch này
                    
                    // Gán vào DTO (kiểm tra null an toàn)
                    dto.setTenKhoaHoc(thongTin[0] != null ? thongTin[0].toString() : null);
                    dto.setTenHocVien(thongTin[1] != null ? thongTin[1].toString() : null);
                    dto.setTenPhuHuynh(thongTin[2] != null ? thongTin[2].toString() : null);
                    dto.setSdtPhuHuynh(thongTin[3] != null ? thongTin[3].toString() : null);
                }
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
}