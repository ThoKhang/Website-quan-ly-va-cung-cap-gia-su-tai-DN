package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "LichDay")
@Data
public class LichDay {
    @Id
    @Column(name = "idLichDay", length = 20)
    private String idLichDay;

    // true = Đang rảnh (Chưa ai đặt), false = Đã bận
    private Boolean tinhTrang;

    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;

    @ManyToOne
    @JoinColumn(name = "idTietHoc")
    private TietHoc tietHoc;
}