package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "PhuHuynh")
@Data
public class PhuHuynh {
    @Id
    @Column(name = "idPhuHuynh", length = 20)
    private String idPhuHuynh;

    @Column(length = 50)
    private String tenPhuHuynh;

    private Boolean gioiTinh;
    private LocalDateTime ngaySinh;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(length = 50)
    private String soNhaTenDuong;

    @OneToOne // Quan hệ 1-1 với tài khoản
    @JoinColumn(name = "idTaiKhoan")
    private TaiKhoan taiKhoan;

    @ManyToOne
    @JoinColumn(name = "idPhuongXa")
    private PhuongXa phuongXa;
}