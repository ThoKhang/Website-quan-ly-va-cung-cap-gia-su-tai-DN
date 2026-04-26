package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuThanhToan")
@Data
public class LichSuThanhToan {
    @Id
    @Column(name = "idThanhToan", length = 20)
    private String idThanhToan;

    private BigDecimal soTien;

    @Column(length = 30)
    private String trangThai;

    private LocalDateTime ngayThanhToan;

    @Column(length = 30)
    private String phuongThucThanhToan;

    @Column(length = 50)
    private String maGiaoDich;

    @ManyToOne
    @JoinColumn(name = "idDangKy")
    private DangKyHoc dangKyHoc;
}