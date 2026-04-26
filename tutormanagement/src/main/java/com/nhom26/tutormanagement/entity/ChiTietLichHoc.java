package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ChiTietLichHoc")
@Data
public class ChiTietLichHoc {
    @Id
    @Column(name = "idLichHoc", length = 20)
    private String idLichHoc;

    @ManyToOne
    @JoinColumn(name = "idDangKy")
    private DangKyHoc dangKyHoc;

    @ManyToOne
    @JoinColumn(name = "idLichDay")
    private LichDay lichDay;

    private LocalDateTime ngayHoc;

    @Column(length = 30)
    private String tinhTrang;
}