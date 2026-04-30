package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThongKeDoanhThuDTO {
    private String thangNam; // Ví dụ: "04/2026"
    private Long soLuongLopMoi; // Số khóa học được đăng ký
    private BigDecimal tongDoanhThu; // Tổng tiền thanh toán thành công
}