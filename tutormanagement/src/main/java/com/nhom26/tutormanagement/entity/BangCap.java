package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "BangCap")
@Data
public class BangCap {
    @Id
    @Column(name = "idBangCap", length = 20)
    private String idBangCap;

    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;

    @Column(length = 50)
    private String tenBangCap;

    @Column(length = 150)
    private String thongTinBangCap;

    private LocalDateTime ngayCap;
    private Boolean trangThai;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String anhMinhChung;
}