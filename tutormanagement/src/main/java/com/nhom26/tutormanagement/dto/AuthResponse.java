package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private String loaiNguoiDungID; // Để ReactJS biết là Gia sư hay Phụ huynh để chuyển trang
    private String idNguoiDung; // Trả về idGiaSu hoặc idPhuHuynh để Frontend gọi API tiếp theo
}