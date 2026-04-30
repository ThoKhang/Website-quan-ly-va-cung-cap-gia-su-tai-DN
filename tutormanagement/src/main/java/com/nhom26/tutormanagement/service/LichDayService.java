/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 *
 * @author Tho Khang
 */
@Service
@RequiredArgsConstructor
public class LichDayService {
    private final LichDayRepository lichDayRepository;

    private String generateNextId() {
        String maxId = lichDayRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "LD001";
        }
        String cleanId = maxId.trim();
        int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
        return String.format("LD%03d", nextNumber);
    }

    public LichDay save(LichDay lichDay) {
        if (lichDay.getIdLichDay() == null || lichDay.getIdLichDay().isEmpty()) {
            lichDay.setIdLichDay(generateNextId());
        }
        return lichDayRepository.save(lichDay);
    }
}