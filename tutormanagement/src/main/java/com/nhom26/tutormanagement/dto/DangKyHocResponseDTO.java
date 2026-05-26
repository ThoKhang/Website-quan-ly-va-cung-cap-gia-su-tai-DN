package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DangKyHocResponseDTO {
    private String idDangKy;
    private KhoaHocResponseDTO khoaHoc;
    private LocalDateTime ngayDangKy;
    private LocalDate ngayBatDauHoc;
    private LocalDate ngayKetThucDuKien;
    private LocalDate ngayGiaHan;
    private Boolean trangThaiThanhToan;
    private Boolean trangThaiHoanThanh;
    private List<ChiTietLichHocResponseDTO> chiTietLichHoc;

    private String idYeuCauGiaHan;
    private String trangThaiGiaHan;   // "Chờ duyệt", "Đã duyệt", "Từ chối"
    private Integer soBuoiGiaHan;
    private String loaiGiaHan;
}