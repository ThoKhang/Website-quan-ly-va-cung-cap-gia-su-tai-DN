package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class TietHocRequestDTO {
    // Thứ (VD: "Thứ 2", "Thứ 3", ...)
    private String thu;
    
    // Giờ bắt đầu (VD: "17:30")
    @JsonFormat(pattern = "HH:mm")
    private String gioBatDau;
    
    // Giờ kết thúc (VD: "19:30")
    @JsonFormat(pattern = "HH:mm")
    private String gioKetThuc;
    
    // Số tiết sẽ được tính tự động từ gioBatDau và gioKetThuc
    // (55 phút = 1 tiết)
}
