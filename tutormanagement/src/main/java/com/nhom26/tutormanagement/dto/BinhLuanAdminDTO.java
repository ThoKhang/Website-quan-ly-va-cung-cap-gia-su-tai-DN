package com.nhom26.tutormanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime; 

@Data
@NoArgsConstructor
public class BinhLuanAdminDTO {
    private String idDanhGia;
    private String idDangKy;
    private String tenPhuHuynh;
    private String tenKhoaHoc;
    private String tenGiaSu;
    private Integer soSao;
    private String noiDung;
    private LocalDateTime ngayDanhGia; 

    public BinhLuanAdminDTO(String idDanhGia, String idDangKy, String tenPhuHuynh, 
                            String tenKhoaHoc, String tenGiaSu, Integer soSao, 
                            String noiDung, LocalDateTime ngayDanhGia) { 
        this.idDanhGia = idDanhGia;
        this.idDangKy = idDangKy;
        this.tenPhuHuynh = tenPhuHuynh;
        this.tenKhoaHoc = tenKhoaHoc;
        this.tenGiaSu = tenGiaSu;
        this.soSao = soSao;
        this.noiDung = noiDung;
        this.ngayDanhGia = ngayDanhGia;
    }
}