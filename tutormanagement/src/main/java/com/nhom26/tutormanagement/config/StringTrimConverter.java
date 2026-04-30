package com.nhom26.tutormanagement.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true) // autoApply = true giúp áp dụng cho TẤT CẢ các cột String
public class StringTrimConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute; // Khi lưu xuống thì giữ nguyên (SQL sẽ tự bù khoảng trắng cho CHAR)
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        // Khi lấy từ DB lên Java: Tự động gọt sạch khoảng trắng
        return dbData != null ? dbData.trim() : null;
    }
}