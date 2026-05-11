package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 *
 * @author Tho Khang
 */
@Service
@RequiredArgsConstructor
public class LichDayService {
    private final LichDayRepository lichDayRepository;

    private String generateNextId() {
        try {
            List<String> allIds = lichDayRepository.findAllIdsSorted();
            if (allIds == null || allIds.isEmpty()) {
                return "LD001";
            }
            
            int maxNumber = 0;
            for (String id : allIds) {
                try {
                    String trimmedId = id.trim();
                    if (trimmedId.startsWith("LD") && trimmedId.length() >= 5) {
                        int number = Integer.parseInt(trimmedId.substring(2, 5));
                        if (number > maxNumber) {
                            maxNumber = number;
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid IDs
                }
            }
            
            return String.format("LD%03d", maxNumber + 1);
        } catch (Exception e) {
            return "LD001";
        }
    }

    public LichDay save(LichDay lichDay) {
        if (lichDay.getIdLichDay() == null || lichDay.getIdLichDay().isEmpty()) {
            lichDay.setIdLichDay(generateNextId());
        }
        return lichDayRepository.save(lichDay);
    }
}