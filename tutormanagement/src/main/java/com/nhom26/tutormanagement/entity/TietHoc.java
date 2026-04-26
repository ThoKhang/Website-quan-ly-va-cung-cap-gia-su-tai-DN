package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "TietHoc")
@Data
public class TietHoc {
    @Id
    @Column(name = "idTietHoc", length = 20)
    private String idTietHoc;

    @Column(length = 30)
    private String thu;

    // Dùng LocalTime hợp lý hơn cho Giờ bắt đầu/Kết thúc trong ngày
    private LocalTime gioBatDau; 
    private LocalTime gioKetThuc;
    private Integer soTiet;
}