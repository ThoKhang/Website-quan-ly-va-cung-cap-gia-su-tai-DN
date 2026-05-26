package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "YeuCauGiaHan")
@Data
public class YeuCauGiaHan {
    @Id
    private String idGiaHan;

    @ManyToOne
    @JoinColumn(name = "idDangKy")
    private DangKyHoc dangKyHoc;

    private Integer soBuoiGiaHan;
    private String loaiGiaHan;
    private LocalDateTime ngayYeuCau;
    private String trangThaiDuyet;
}