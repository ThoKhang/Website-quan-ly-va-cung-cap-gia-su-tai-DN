package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "PhuongXa")
@Data
public class PhuongXa {
    @Id
    @Column(name = "maPhuongXa", length = 20)
    private String maPhuongXa;

    @Column(length = 100)
    private String tenPhuongXa;

    @ManyToOne
    @JoinColumn(name = "idQuanHuyen")
    private QuanHuyen quanHuyen;
}