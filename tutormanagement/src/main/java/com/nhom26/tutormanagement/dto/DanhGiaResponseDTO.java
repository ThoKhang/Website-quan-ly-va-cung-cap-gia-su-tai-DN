package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaResponseDTO {
    private String idDanhGia;
    private Integer soSao;
    private String noiDung;
    private LocalDateTime ngayDanhGia;
    private String tenPhuHuynh;
    private String anhDaiDien;
}
