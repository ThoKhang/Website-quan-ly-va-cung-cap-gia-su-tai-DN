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
public class ChiTietLichHocResponseDTO {
    private String idLichHoc;
    private LocalDateTime ngayHoc;
    private String tinhTrang;
    private LichRanhDTO lichDay;
}
