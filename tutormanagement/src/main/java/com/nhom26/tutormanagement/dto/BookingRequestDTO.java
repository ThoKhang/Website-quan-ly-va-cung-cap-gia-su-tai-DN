package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import lombok.Data;
import java.util.List;

@Data
public class BookingRequestDTO {
    private String idPhuHuynh;
    private String idHocVien; // Học viên nào sẽ học
    private String idKhoaHoc; // Học khóa nào
    
    // Danh sách các "Lịch Dạy" (Ca rảnh của gia sư) mà phụ huynh đã tick chọn
    private List<String> danhSachIdLichDay; 
    
    private String phuongThucThanhToan; // Tiền mặt, Chuyển khoản...
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngayBatDauHoc;
}