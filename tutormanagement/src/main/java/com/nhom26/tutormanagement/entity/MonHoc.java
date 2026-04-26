package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MonHoc")
@Data
public class MonHoc {
    @Id
    @Column(name = "idMonHoc", length = 20)
    private String idMonHoc;

    @Column(length = 30)
    private String tenMonHoc;
}