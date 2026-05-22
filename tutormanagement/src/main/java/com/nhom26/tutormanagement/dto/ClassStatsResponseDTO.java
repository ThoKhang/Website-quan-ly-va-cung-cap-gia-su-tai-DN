package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassStatsResponseDTO {
    private String name;       // Tên tháng
    private int tongYeuCau;
    private int daNhanLop;
    private int dangHoc;
    private int daHoanThanh;
}