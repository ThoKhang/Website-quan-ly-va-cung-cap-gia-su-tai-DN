
package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseDTO {
    private boolean success;
    private String message;
    private Object data; // Chứa dữ liệu trả về nếu success = true
}
