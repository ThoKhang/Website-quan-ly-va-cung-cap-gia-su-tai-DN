package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PhuHuynhUpdateDTO {
    private String tenPhuHuynh;
    private Boolean gioiTinh;
    private LocalDate ngaySinh;
    private String sdt;
    private String cccd;
    private String soNhaTenDuong;
    private String maPhuongXa;
}
