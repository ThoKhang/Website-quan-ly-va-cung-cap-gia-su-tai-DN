package com.nhom26.tutormanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "KhoaHoc")
@Data
public class KhoaHoc {
    @Id
    @Column(name = "idKhoaHoc", length = 20)
    private String idKhoaHoc;

    @Column(length = 50)
    private String tenKhoaHoc;

    @Column(length = 300)
    private String moTa;

    @Column(length = 30)
    private String yeuCau;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String noiDungKhoaHoc;

    @Column(name = "soTienHoc")
    private BigDecimal soTienHoc;

    // THÊM TRƯỜNG NÀY: 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
    private Integer tinhTrang;

    @ManyToOne
    @JoinColumn(name = "idGiaSu")
    private GiaSu giaSu;

    @ManyToOne
    @JoinColumn(name = "idMonHoc")
    private MonHoc monHoc;

    @ManyToOne
    @JoinColumn(name = "idDanhMucLop")
    private DanhMucLop danhMucLop;
    
    @Column(name = "soBuoiHoc")
    private Integer soBuoiHoc; // Ví dụ: 10 buổi, 20 buổi
    
    @Column(name = "anhMinhHoa", length = 255)
    private String anhMinhHoa;
}