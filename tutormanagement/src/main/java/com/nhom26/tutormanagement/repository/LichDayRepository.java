package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.LichDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface LichDayRepository extends JpaRepository<LichDay, String> {
    // Tìm tất cả các khung giờ đang "Trống" (tinhTrang = true) của 1 Gia sư cụ thể
    // Hàm này dùng để hiển thị lịch cho Phụ huynh chọn khi book lớp
    List<LichDay> findByGiaSu_IdGiaSuAndTinhTrangIsTrue(String idGiaSu);
    
    /**
     * [MỚI CẬP NHẬT]
     * Kiểm tra xem Gia sư đã có lịch dạy cho một Tiết học cụ thể chưa.*/
    boolean existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(String idGiaSu, String idTietHoc);

    /**
     * [MỚI CẬP NHẬT]
     * Tìm toàn bộ lịch của gia sư (bao gồm cả Rảnh và Đã bận).*/
    List<LichDay> findByGiaSu_IdGiaSu(String idGiaSu);

    @Query("SELECT MAX(l.idLichDay) FROM LichDay l")
    String findMaxId();
}