package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietLichHocRepository extends JpaRepository<ChiTietLichHoc, String> {
    // Tìm chi tiết lịch học dựa theo ID của phiếu đăng ký
    List<ChiTietLichHoc> findByDangKyHoc_IdDangKy(String idDangKy);
}