package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class KhoaHocRequestDTO {
    private String tenKhoaHoc;
    private String moTa;
    private String yeuCau;
    private String noiDungKhoaHoc;
    private BigDecimal soTienHoc;

    // Chỉ cần nhận ID khóa ngoại thay vì cả object
    private String idGiaSu;
    private String idMonHoc;
    private String idDanhMucLop;

    // Danh sách các ID Tiết học (ví dụ: ["T2_Ca1", "T4_Ca2"]) để hệ thống tự bung ra bảng LichDay
    private List<String> danhSachIdTietHocRanh;
}