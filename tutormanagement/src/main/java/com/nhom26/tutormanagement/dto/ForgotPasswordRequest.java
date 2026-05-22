package com.nhom26.tutormanagement.dto;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String identifier; // Dùng chung cho cả Email hoặc Tên đăng nhập
}