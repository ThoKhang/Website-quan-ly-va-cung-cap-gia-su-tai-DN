package com.nhom26.tutormanagement.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String tenDangNhap;
    private String matKhau;
}