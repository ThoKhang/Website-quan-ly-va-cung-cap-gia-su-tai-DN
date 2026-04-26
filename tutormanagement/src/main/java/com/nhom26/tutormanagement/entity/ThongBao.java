package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ThongBao")
@Data
public class ThongBao {
    @Id
    @Column(name = "idThongBao", length = 20)
    private String idThongBao;

    @Column(length = 50)
    private String tieuDe;

    @Column(length = 200)
    private String noiDungThongBao;

    @ManyToOne
    @JoinColumn(name = "idTaiKhoan")
    private TaiKhoan taiKhoan;
}