/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.GiaSuLuongAdminDTO;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.entity.LichSuTraLuong;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import com.nhom26.tutormanagement.repository.LichSuTraLuongRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 *
 * @author Tho Khang
 */
@Service
@Transactional
public class TraLuongService {

    @Autowired
    private GiaSuRepository giaSuRepository;

    @Autowired
    private LichSuTraLuongRepository lichSuTraLuongRepository;

    // 1. Lấy danh sách gia sư cần trả lương (luongHienCon > 0)
    public List<GiaSuLuongAdminDTO> getDanhSachGiaSuCanTraLuong() {
        return giaSuRepository.findDanhSachTraLuong();
    }

    // 2. Xử lý thanh toán lương
    public void thanhToanLuong(String idGiaSu, Double soTienThanhToan) {
        // Tìm gia sư
        GiaSu giaSu = giaSuRepository.findById(idGiaSu)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gia sư với mã: " + idGiaSu));

        // Kiểm tra xem gia sư có dư nợ lương không
        if (giaSu.getLuongHienCon() == null || giaSu.getLuongHienCon() <= 0) {
            throw new RuntimeException("Gia sư này không có dư nợ lương để thanh toán!");
        }

        // Tự động sinh mã idTraLuong (TL0001, TL0002...)
        String maxId = lichSuTraLuongRepository.findMaxId();
        String newId = "TL0001";
        if (maxId != null && maxId.startsWith("TL")) {
            try {
                int currentNum = Integer.parseInt(maxId.substring(2));
                newId = String.format("TL%04d", currentNum + 1);
            } catch (NumberFormatException e) {
                // Fallback an toàn nếu chuỗi parse bị lỗi
                newId = "TL" + System.currentTimeMillis(); 
            }
        }
        BigDecimal soTienDecimal = BigDecimal.valueOf(soTienThanhToan);
        // Tạo bản ghi Lịch sử trả lương
        LichSuTraLuong ls = new LichSuTraLuong();
        ls.setIdTraLuong(newId);
        ls.setGiaSu(giaSu);
        ls.setTinhTrang(true); // true = Đã thanh toán thành công
        ls.setNgayThanhToan(LocalDateTime.now());
        ls.setSoTien(soTienDecimal);
        ls.setPhuongThucThanhToan("Chuyển khoản QR");
        ls.setMaGiaoDich("SYS_PAY_" + System.currentTimeMillis());

        // Lưu lịch sử
        lichSuTraLuongRepository.save(ls);

        // Cập nhật lại lương hiện còn của Gia Sư về 0
        giaSu.setLuongHienCon(0.0);
        giaSuRepository.save(giaSu);
    }
}