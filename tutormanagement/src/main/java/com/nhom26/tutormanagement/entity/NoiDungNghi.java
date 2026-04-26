package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "NoiDungNghi")
@Data
public class NoiDungNghi {
    @Id
    @Column(name = "idNoiDung", length = 20)
    private String idNoiDung;

    @Column(length = 50)
    private String lyDoNghi;

    private LocalDateTime thoiGianGui;

    @OneToOne
    @JoinColumn(name = "idLichHoc")
    private ChiTietLichHoc chiTietLichHoc;
}