package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "DanhMucLop")
@Data
public class DanhMucLop {
    @Id
    @Column(name = "idDanhMucLop", length = 20)
    private String idDanhMucLop;

    @Column(length = 50)
    private String tenLop;

    @ManyToOne
    @JoinColumn(name = "maCapHoc")
    private CapHoc capHoc;
}