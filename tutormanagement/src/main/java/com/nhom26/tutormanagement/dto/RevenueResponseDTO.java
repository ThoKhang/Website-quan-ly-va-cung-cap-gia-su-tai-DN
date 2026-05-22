package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueResponseDTO {
    private String name;       // "Tháng 1/2026"
    private double doanhThu;   // Tổng tiền
    private int soLop;         // Số lượng lớp (lượt đăng ký)
}