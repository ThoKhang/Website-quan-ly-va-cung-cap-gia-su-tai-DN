package com.nhom26.tutormanagement.dto;

import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    private String matKhauCu;
    private String matKhauMoi;
    private String xacNhanMatKhau;
    private String otp;
}