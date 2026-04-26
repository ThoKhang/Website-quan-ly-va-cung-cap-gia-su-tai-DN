package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "CapHoc")
@Data
public class CapHoc {
    @Id
    @Column(name = "maCapHoc", length = 20)
    private String maCapHoc;

    @Column(length = 50)
    private String tenCapHoc;
}