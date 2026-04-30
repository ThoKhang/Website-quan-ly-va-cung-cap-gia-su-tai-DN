package com.nhom26.tutormanagement.util;

import java.util.UUID;

public class IdGeneratorUtil {
    public static String generateId() {
        // Sinh UUID ngẫu nhiên, bỏ dấu gạch ngang và lấy đúng 20 ký tự đầu
        return UUID.randomUUID().toString().replace("-", "").substring(0, 20);
    }
}