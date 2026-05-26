package com.nhom26.tutormanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LopDangDayDTO {
    private String idDangKy;
    private String idHocVien;
    private String tenHocVien;
    private String tenPhuHuynh;
    private String sdtPhuHuynh;
    private String tenKhoaHoc;
    private String ngayBatDauHoc;
    private String ngayKetThucDuKien;
    private String loaiDangKy;
    private Boolean trangThaiHoanThanh;
}