package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate; // Chuyển sang LocalDate để fix lỗi parse ngày sinh

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
    
    private LocalDate ngaySinh; // Chỉ cần ngày, tháng, năm cho ngày sinh

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(length = 50)
    private String soNhaTenDuong;

    @OneToOne // Quan hệ 1-1
    @JoinColumn(name = "idTaiKhoan", unique = true) // THÊM unique = true để bảo mật tầng DB
    private TaiKhoan taiKhoan;

    @ManyToOne
    @JoinColumn(name = "idPhuongXa")
    private PhuongXa phuongXa;
}