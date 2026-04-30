package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.HocVien;
import com.nhom26.tutormanagement.repository.HocVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HocVienService {
    private final HocVienRepository hocVienRepository;

    private String generateNextId() {
        String maxId = hocVienRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) {
            return "HV001";
        }
        String cleanId = maxId.trim();
        int nextNumber = Integer.parseInt(cleanId.substring(2)) + 1;
        return String.format("HV%03d", nextNumber);
    }

    public HocVien save(HocVien hocVien) {
        if (hocVien.getIdHocVien() == null || hocVien.getIdHocVien().isEmpty()) {
            hocVien.setIdHocVien(generateNextId());
        }
        return hocVienRepository.save(hocVien);
    }
}