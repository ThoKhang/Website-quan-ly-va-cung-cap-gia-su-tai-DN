package com.nhom26.tutormanagement.dto;

import lombok.Data;

@Data
public class DanhGiaRequestDTO {
    private String idDangKy;
    private Integer soSao; // Từ 1 đến 5
    private String noiDung;
}