package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BangCapDTO {
    private String idBangCap;
    private String tenBangCap;
    private String thongTinBangCap;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate ngayCap;
    
    private Integer trangThai;
    private String anhMinhChung;
    private String idGiaSu;
    private String tenGiaSu;
}
