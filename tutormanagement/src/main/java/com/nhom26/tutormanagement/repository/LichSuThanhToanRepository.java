package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.LichSuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LichSuThanhToanRepository extends JpaRepository<LichSuThanhToan, String> {
    
    // Sử dụng @Query để viết câu lệnh SQL tính Tổng doanh thu trong 1 khoảng thời gian
    @Query("SELECT SUM(l.soTien) FROM LichSuThanhToan l WHERE l.trangThai = 'Đã thanh toán' AND l.ngayThanhToan BETWEEN :startDate AND :endDate")
    BigDecimal sumDoanhThuTrongKhoangThoiGian(@Param("startDate") java.time.LocalDateTime startDate, 
                                              @Param("endDate") java.time.LocalDateTime endDate);
    // Gom nhóm tổng doanh thu và đếm số lớp (idDangKy) theo từng tháng
    @Query(value = "SELECT " +
            "MONTH(ngayThanhToan) AS thang, " +
            "SUM(soTien) AS doanhThu, " +
            "COUNT(idDangKy) AS soLop " +
            "FROM LichSuThanhToan " +
            "WHERE YEAR(ngayThanhToan) = :year " +
            // Bạn có thể mở comment dòng dưới nếu muốn chỉ tính các giao dịch thành công
            // "AND trangThai = N'Thành công' " + 
            "GROUP BY MONTH(ngayThanhToan) " +
            "ORDER BY MONTH(ngayThanhToan)", nativeQuery = true)
    List<Object[]> thongKeDoanhThuTheoThang(@Param("year") int year);
    
    @Query("SELECT MAX(l.idThanhToan) FROM LichSuThanhToan l")
    String findMaxId();
    
}