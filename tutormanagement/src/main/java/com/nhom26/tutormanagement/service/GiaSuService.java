package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GiaSuService {

    private final LichDayRepository lichDayRepository;

    public List<LichDay> layLichRanhCuaGiaSu(String idGiaSu) {
        List<LichDay> danhSachLichRanh = lichDayRepository.findByGiaSu_IdGiaSuAndTinhTrangTrue(idGiaSu);
        
        if (danhSachLichRanh.isEmpty()) {
            throw new RuntimeException("Gia sư này hiện không có lịch rảnh nào!");
        }
        
        return danhSachLichRanh;
    }
}