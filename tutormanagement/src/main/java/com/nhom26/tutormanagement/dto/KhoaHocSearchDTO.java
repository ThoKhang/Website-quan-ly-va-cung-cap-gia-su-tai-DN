package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhoaHocSearchDTO {
    private String idKhoaHoc;
    private String tenKhoaHoc;
    private String moTa;
    private String yeuCau;
    private BigDecimal soTienHoc;
    private Integer soBuoiHoc;
    private String tenMonHoc;
    private String tenLop;
    private Double soSaoTrungBinh;
    private Integer soLuongDanhGia;
}
