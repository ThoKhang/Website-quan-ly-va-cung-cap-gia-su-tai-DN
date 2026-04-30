package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThongKeGiaSuDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private Long soLopDaNhan;
    private Double diemDanhGiaTrungBinh;
}