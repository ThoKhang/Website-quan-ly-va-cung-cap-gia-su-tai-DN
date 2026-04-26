package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "DanhGia")
@Data
public class DanhGia {
    @Id
    @Column(name = "idDanhGia", length = 20)
    private String idDanhGia;

    @OneToOne
    @JoinColumn(name = "idDangKy")
    private DangKyHoc dangKyHoc;

    private Integer soSao;

    @Column(length = 300)
    private String noiDung;

    private LocalDateTime ngayDanhGia;
}