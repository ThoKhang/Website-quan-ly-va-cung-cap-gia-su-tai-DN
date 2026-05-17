package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.util.List;

@Data
public class GiaSuDetailResponseDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private String sdt;
    private String cccd; 
    private String email;
    private Double saoTrungBinh;
    
    // ĐỔI SANG LIST OBJECT ĐỂ FRONTEND ĐỌC ĐƯỢC
    private List<BangCapDTO> bangCapList; 
}