package com.nhom26.tutormanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "BangCap")
@Data
public class BangCap {
    @Id
    @Column(name = "idBangCap", length = 20)
    private String idBangCap;

    @Column(length = 50)
    private String tenBangCap;

    @Column(length = 150)
    private String thongTinBangCap;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngayCap;

    // true = Đã xác thực, false = Chờ xác thực
    private Integer trangThai;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String anhMinhChung; // Có thể lưu URL ảnh (từ Cloudinary/Firebase) hoặc chuỗi Base64

    // Khóa ngoại liên kết với Gia Sư
    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;
}