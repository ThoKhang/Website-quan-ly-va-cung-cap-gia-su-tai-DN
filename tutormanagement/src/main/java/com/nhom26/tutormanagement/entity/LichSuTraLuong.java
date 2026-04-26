package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuTraLuong")
@Data
public class LichSuTraLuong {
    @Id
    @Column(name = "idTraLuong", length = 20)
    private String idTraLuong;

    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;

    private Boolean tinhTrang;
    private LocalDateTime ngayThanhToan;
    
    private BigDecimal soTien;

    @Column(length = 50)
    private String phuongThucThanhToan;

    @Column(length = 50)
    private String maGiaoDich;
}