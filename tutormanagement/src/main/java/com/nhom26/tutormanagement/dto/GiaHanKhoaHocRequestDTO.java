package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaHanKhoaHocRequestDTO {
    private LocalDate ngayBatDauMoi; // Ngày bắt đầu mới do phụ huynh chọn
}
