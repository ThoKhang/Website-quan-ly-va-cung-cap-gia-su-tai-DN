package com.nhom26.tutormanagement.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaiKhoanAdminDTO {
    private String idTaiKhoan;
    private String tenDangNhap;
    private String email;
    private String loaiNguoiDungID; // "1": Phụ huynh, "2": Gia sư, "4": Admin
    private Integer trangThai;      // 1: Hoạt động, 0: Bị khóa
    private LocalDateTime ngayTao;
}