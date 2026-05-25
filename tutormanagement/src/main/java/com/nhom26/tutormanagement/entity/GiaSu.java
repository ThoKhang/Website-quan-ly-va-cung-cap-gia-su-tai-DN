package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "GiaSu")
@Data
public class GiaSu {
    @Id
    @Column(name = "idGiaSu", length = 20)
    private String idGiaSu;

    @OneToOne
    @JoinColumn(name = "idTaiKhoan")
    private TaiKhoan taiKhoan;

    @Column(length = 50)
    private String tenGiaSu;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(name = "ngay")
    private LocalDateTime ngay;

    @Column(name = "trangThai")
    private Integer trangThai;

    @Column(name = "heSoLuong")
    private Double heSoLuong;

    @Column(name = "luongHienCon")
    private Double luongHienCon;
}