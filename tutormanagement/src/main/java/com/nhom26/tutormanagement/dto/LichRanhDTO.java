package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichRanhDTO {
    private String idLichDay;
    private Boolean tinhTrang;
    private TietHocDTO tietHoc;

    private String tenKhoaHoc;
    private String tenHocVien;
    private String tenPhuHuynh;
    private String sdtPhuHuynh;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TietHocDTO {
        private String idTietHoc;
        private String thu;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalDateTime gioBatDau;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalDateTime gioKetThuc;
        
        private Integer soTiet;
    }
}