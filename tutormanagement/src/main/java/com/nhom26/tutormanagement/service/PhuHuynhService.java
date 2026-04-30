package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import com.nhom26.tutormanagement.repository.PhuHuynhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PhuHuynhService {
    private final PhuHuynhRepository phuHuynhRepository;

    public PhuHuynh save(PhuHuynh phuHuynh) {
        // Bạn có thể thêm logic sinh ID cho Phụ huynh ở đây (VD: PH001)
        if (phuHuynh.getIdPhuHuynh() == null) {
            phuHuynh.setIdPhuHuynh("PH001"); // Tạm thời để test
        }
        return phuHuynhRepository.save(phuHuynh);
    }
}