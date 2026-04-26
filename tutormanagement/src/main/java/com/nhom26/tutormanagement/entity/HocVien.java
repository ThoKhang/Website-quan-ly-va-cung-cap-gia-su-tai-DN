package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "HocVien")
@Data
public class HocVien {
    @Id
    @Column(name = "idHocVien", length = 20)
    private String idHocVien;

    @Column(length = 50)
    private String tenHocVien;

    private Boolean gioiTinh;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    private LocalDateTime ngaySinh;

    @ManyToOne
    @JoinColumn(name = "idPhuHuynh")
    private PhuHuynh phuHuynh;
}