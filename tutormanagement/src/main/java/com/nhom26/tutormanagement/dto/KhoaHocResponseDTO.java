package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KhoaHocResponseDTO {
    private String idKhoaHoc;
    private String tenKhoaHoc;
    private String moTa;
    private String yeuCau;
    private String noiDungKhoaHoc;
    private BigDecimal soTienHoc;
    private Integer soBuoiHoc;
    private String anhMinhHoa;
    // Gom dữ liệu từ các bảng khác lại thành chuỗi dễ đọc
    private String idGiaSu; // ID của gia sư (để lấy lịch rảnh)
    private String tenMonHoc;
    private String tenLop;
    private String tenGiaSu;
    private Double saoTrungBinh; // Lấy từ đánh giá của Gia sư
    private Integer trangThai; // 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
    private String idMonHoc;
    private String idDanhMucLop;
    private java.util.List<DanhGiaResponseDTO> danhGias;
}