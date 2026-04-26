package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "NhanVien")
@Data
public class NhanVien {
    @Id
    @Column(name = "idNhanVien", length = 20)
    private String idNhanVien;

    @OneToOne
    @JoinColumn(name = "idTaiKhoan")
    private TaiKhoan taiKhoan;

    @Column(length = 30)
    private String tenNhanVien;

    @Column(name = "SDT", length = 10)
    private String sdt;

    @Column(length = 30)
    private String chucVu;

    @Column(name = "CCCD", length = 20)
    private String cccd;
}