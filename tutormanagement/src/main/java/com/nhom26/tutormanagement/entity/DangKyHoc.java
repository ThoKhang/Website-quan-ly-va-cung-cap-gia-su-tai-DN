package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "DangKyHoc")
@Data
public class DangKyHoc {
    @Id
    @Column(name = "idDangKy", length = 20)
    private String idDangKy;

    @ManyToOne
    @JoinColumn(name = "idPhuHuynh")
    private PhuHuynh phuHuynh;

    @ManyToOne
    @JoinColumn(name = "idHocVien")
    private HocVien hocVien;

    @ManyToOne
    @JoinColumn(name = "idKhoaHoc")
    private KhoaHoc khoaHoc;

    private LocalDateTime ngayDangKy;

    @Column(length = 50)
    private String loaiDangKy;

    private Boolean trangThaiThanhToan;
    private Boolean trangThaiHoanThanh;
}