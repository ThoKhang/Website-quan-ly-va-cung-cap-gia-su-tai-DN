package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class YeuCauGiaHanDTO {
    private String idGiaHan;
    private String idDangKy;
    private String tenKhoaHoc;
    private String tenHocVien;
    private String sdtPhuHuynh;
    private Integer soBuoiGiaHan;
    private String loaiGiaHan;
    private String ngayKetThucCu;
    private LocalDateTime ngayYeuCau;
    private String trangThai; 
}