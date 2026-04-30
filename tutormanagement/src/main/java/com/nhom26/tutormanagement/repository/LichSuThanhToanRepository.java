package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface LichSuThanhToanRepository extends JpaRepository<LichSuThanhToan, String> {
    
    // Sử dụng @Query để viết câu lệnh SQL tính Tổng doanh thu trong 1 khoảng thời gian
    @Query("SELECT SUM(l.soTien) FROM LichSuThanhToan l WHERE l.trangThai = 'Đã thanh toán' AND l.ngayThanhToan BETWEEN :startDate AND :endDate")
    BigDecimal sumDoanhThuTrongKhoangThoiGian(@Param("startDate") java.time.LocalDateTime startDate, 
                                              @Param("endDate") java.time.LocalDateTime endDate);
}