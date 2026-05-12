package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietLichHocDTO {
    private String idLichHoc;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayHoc;
    
    private String tinhTrang;
    
    private LichDayDTO lichDay;
    private KhoaHocDTO khoaHoc;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LichDayDTO {
        private String idLichDay;
        private Boolean tinhTrang;
        
        private GiaSuDTO giaSu;
        private TietHocDTO tietHoc;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class GiaSuDTO {
            private String idGiaSu;
            private String tenGiaSu;
            private String sdt;
            private String email;
            private Double saoTrungBinh;
            private Integer soLuongKhoaHoc;
            private Integer soLuongDanhGia;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class TietHocDTO {
            private String idTietHoc;
            private String thu;
            
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
            private LocalDateTime gioBatDau;
            
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
            private LocalDateTime gioKetThuc;
            
            private Integer soTiet;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KhoaHocDTO {
        private String idKhoaHoc;
        private String tenKhoaHoc;
        private String moTa;
        private String yeuCau;
        private BigDecimal soTienHoc;
        private Integer soBuoiHoc;
        private String tenMonHoc;
        private String tenLop;
        private Double soSaoTrungBinh;
        private Integer soLuongDanhGia;
    }
}

