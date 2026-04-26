package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "KhoaHoc")
@Data
public class KhoaHoc {
    @Id
    @Column(name = "idKhoaHoc", length = 20)
    private String idKhoaHoc;

    @Column(length = 50)
    private String tenKhoaHoc;

    @Column(length = 300)
    private String moTa;

    @Column(length = 30)
    private String yeuCau;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String noiDungKhoaHoc;

    private BigDecimal soTienHoc;

    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;

    @ManyToOne
    @JoinColumn(name = "idMonHoc")
    private MonHoc monHoc;
    
    @ManyToOne
    @JoinColumn(name = "idDanhMucLop")
    private DanhMucLop danhMucLop;
}