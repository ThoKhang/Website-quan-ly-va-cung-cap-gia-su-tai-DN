package com.nhom26.tutormanagement.dto;

import lombok.Data;
import java.util.List;

@Data
public class DangKyLichRanhRequestDTO {
    // Gia sư chỉ cần gửi lên danh sách mã Tiết học (VD: ["TH_T2_C1", "TH_T4_C1"])
    private List<String> danhSachIdTietHoc; 
}