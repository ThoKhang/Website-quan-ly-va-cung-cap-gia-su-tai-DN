package com.nhom26.tutormanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GiaSuLuongAdminDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private String nganHang;
    private String stk;
    private Double luongHienCon;

    public GiaSuLuongAdminDTO(String idGiaSu, String tenGiaSu, String nganHang, String stk, Double luongHienCon) {
        this.idGiaSu = idGiaSu;
        this.tenGiaSu = tenGiaSu;
        this.nganHang = nganHang;
        this.stk = stk;
        this.luongHienCon = luongHienCon;
    }
}