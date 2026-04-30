package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.DangKyHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface DangKyHocRepository extends JpaRepository<DangKyHoc, String> {
    // Lấy danh sách các lớp đã đăng ký của một phụ huynh (Dùng cho lịch sử khóa học)
    List<DangKyHoc> findByPhuHuynh_IdPhuHuynhOrderByNgayDangKyDesc(String idPhuHuynh);
    
    // 1. Tìm ID lớn nhất hiện tại để phục vụ logic sinh mã DKxxx
    @Query("SELECT MAX(d.idDangKy) FROM DangKyHoc d")
    String findMaxId();
}