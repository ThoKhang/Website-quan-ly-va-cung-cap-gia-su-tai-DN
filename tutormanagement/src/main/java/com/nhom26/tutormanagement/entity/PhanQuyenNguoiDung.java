package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PhanQuyenNguoiDung")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhanQuyenNguoiDung {
    @Id
    @Column(name = "LoaiNguoiDungID", length = 20)
    private String loaiNguoiDungID;

    @Column(name = "LoaiNguoiDung", length = 50)
    private String loaiNguoiDung;
}