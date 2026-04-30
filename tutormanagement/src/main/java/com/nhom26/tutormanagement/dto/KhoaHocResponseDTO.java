package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KhoaHocResponseDTO {
    private String idKhoaHoc;
    private String tenKhoaHoc;
    private BigDecimal soTienHoc;
    
    // Gom dữ liệu từ các bảng khác lại thành chuỗi dễ đọc
    private String tenMonHoc;
    private String tenLop;
    private String tenGiaSu;
    private Double saoTrungBinh; // Lấy từ đánh giá của Gia sư
}