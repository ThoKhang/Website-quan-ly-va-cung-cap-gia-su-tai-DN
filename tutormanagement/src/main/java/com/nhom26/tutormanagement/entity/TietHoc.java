package com.nhom26.tutormanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "TietHoc")
@Data
public class TietHoc {
    @Id
    @Column(name = "idTietHoc", length = 20)
    private String idTietHoc;

    @Column(length = 30)
    private String thu;

    // Ép Jackson chỉ trả về định dạng Giờ:Phút cho Frontend (Ví dụ: "17:30")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalDateTime gioBatDau;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalDateTime gioKetThuc;

    private Integer soTiet;
}