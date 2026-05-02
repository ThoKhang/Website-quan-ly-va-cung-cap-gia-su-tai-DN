
package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.LopHocDTO;
import com.nhom26.tutormanagement.dto.MonHocDTO;
import com.nhom26.tutormanagement.dto.TietHocDTO;
import com.nhom26.tutormanagement.repository.DanhMucLopRepository;
import com.nhom26.tutormanagement.repository.MonHocRepository;
import com.nhom26.tutormanagement.repository.TietHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class DanhMucService {

    private final MonHocRepository monHocRepository;
    private final DanhMucLopRepository danhMucLopRepository;
    private final TietHocRepository tietHocRepository;

    /**
     * Lấy danh sách toàn bộ Môn Học (Ví dụ: MH01 - Toán Học)
     * @return List<MonHocDTO>
     */
    @Transactional(readOnly = true)
    public List<MonHocDTO> layDanhSachMonHoc() {
        return monHocRepository.findAll().stream()
                .map(mh -> new MonHocDTO(
                        mh.getIdMonHoc(),
                        mh.getTenMonHoc()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách toàn bộ Lớp Học (Ví dụ: L10 - Lớp 10)
     * @return List<LopHocDTO>
     */
    @Transactional(readOnly = true)
    public List<LopHocDTO> layDanhSachLopHoc() {
        return danhMucLopRepository.findAll().stream()
                .map(lop -> new LopHocDTO(
                        lop.getIdDanhMucLop(),
                        lop.getTenLop()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách các Tiết Học (Khung giờ rảnh)
     * Ví dụ: Thứ 2 - Ca 1, Thứ 4 - Ca 2
     * @return List<TietHocDTO>
     */
    @Transactional(readOnly = true)
    public List<TietHocDTO> layDanhSachTietHoc() {
        return tietHocRepository.findAll().stream()
                .map(th -> new TietHocDTO(
                        th.getIdTietHoc(),
                        th.getThu(),
                        th.getGioBatDau(),  // Lấy dữ liệu LocalTime theo Entity bạn đã định nghĩa
                        th.getGioKetThuc()
                ))
                .collect(Collectors.toList());
    }
}
