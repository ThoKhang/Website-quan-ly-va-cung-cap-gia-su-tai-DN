package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "QuanHuyen")
@Data
public class QuanHuyen {
    @Id
    @Column(name = "idQuanHuyen", length = 20)
    private String idQuanHuyen;

    @Column(length = 30)
    private String tenQuanHuyen;
}