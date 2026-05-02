
package com.nhom26.tutormanagement.util;

import org.springframework.stereotype.Component;

@Component
public class IdGeneratorUtil {

  
    public String generateNextId(String currentMaxId, String prefix) {
        if (currentMaxId == null || currentMaxId.isEmpty()) {
            return prefix + "001";
        }

        // Tách phần số ra khỏi tiền tố (ví dụ "KH005" -> "005")
        String numericPart = currentMaxId.substring(prefix.length());
        try {
            int nextNumber = Integer.parseInt(numericPart) + 1;
            // Trả về định dạng prefix + số (đệm thêm số 0 để đủ độ dài)
            return prefix + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return prefix + "001";
        }
    }
}