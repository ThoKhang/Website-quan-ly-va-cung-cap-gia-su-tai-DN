package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaSuSearchDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private String sdt;
    private String anhDaiDien;
    private Double heSoLuong;
    private Double soSaoTrungBinh;
    private Integer soLuongDanhGia;
    private Integer soLuongKhoaHoc;
    private List<KhoaHocSearchDTO> khoaHocs;
    private BangCapDTO bangCap;
    private List<LichRanhDTO> lichRanh;
}
