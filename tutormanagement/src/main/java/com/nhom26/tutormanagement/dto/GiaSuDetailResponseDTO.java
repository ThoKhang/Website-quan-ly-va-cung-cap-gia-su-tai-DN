package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.util.List;

@Data
public class GiaSuDetailResponseDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private String sdt;
    private String email;
    private Double saoTrungBinh;
    // Bạn có thể thêm danh sách bằng cấp nếu muốn
    private List<String> danhSachBangCap; 
}