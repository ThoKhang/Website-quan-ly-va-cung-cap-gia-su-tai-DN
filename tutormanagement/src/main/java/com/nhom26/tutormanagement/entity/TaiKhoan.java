package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "TaiKhoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoan {

    @Id
    @Column(name = "idTaiKhoan", length = 20)
    private String idTaiKhoan;

    @Column(name = "email", length = 50)
    private String email;

    @Column(name = "tenDangNhap", length = 50)
    private String tenDangNhap;

    @Column(name = "matKhau", length = 100) // Nên để dài hơn 15 để chứa mật khẩu đã mã hóa (Bcrypt)
    private String matKhau;

    @Column(name = "anhDaiDien", length = 50)
    private String anhDaiDien;

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @Column(name = "nganHang", length = 30)
    private String nganHang;

    @Column(name = "STK", length = 20)
    private String stk;

    @Column(name = "LoaiNguoiDungID", length = 20)
    private String loaiNguoiDungID;
}