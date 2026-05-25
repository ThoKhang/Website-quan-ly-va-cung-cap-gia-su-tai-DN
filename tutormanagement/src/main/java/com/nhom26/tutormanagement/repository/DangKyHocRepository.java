package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.DangKyHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DangKyHocRepository extends JpaRepository<DangKyHoc, String> {
    // Lấy danh sách các lớp đã đăng ký của một phụ huynh (Dùng cho lịch sử khóa học)
    List<DangKyHoc> findByPhuHuynh_IdPhuHuynhOrderByNgayDangKyDesc(String idPhuHuynh);
    
    // 1. Tìm ID lớn nhất hiện tại để phục vụ logic sinh mã DKxxx
    @Query("SELECT MAX(d.idDangKy) FROM DangKyHoc d")
    String findMaxId();
    
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DangKyHoc d WHERE d.khoaHoc.idKhoaHoc = :idKhoaHoc AND (d.trangThaiHoanThanh = false OR d.trangThaiHoanThanh IS NULL)")
    boolean existsHocVienDangHoc(@Param("idKhoaHoc") String idKhoaHoc);
    @Query(value = "SELECT " +
            "MONTH(ngayDangKy) AS thang, " +
            "COUNT(idDangKy) AS tongYeuCau, " +
            // Đã nhận lớp = Tổng của đang học + đã hoàn thành
            "SUM(CASE WHEN trangThaiHoanThanh IN (0, 1) THEN 1 ELSE 0 END) AS daNhanLop, " +
            // Đang học
            "SUM(CASE WHEN trangThaiHoanThanh = 0 THEN 1 ELSE 0 END) AS dangHoc, " +
            // Đã hoàn thành
            "SUM(CASE WHEN trangThaiHoanThanh = 1 THEN 1 ELSE 0 END) AS daHoanThanh " +
            "FROM DangKyHoc " +
            "WHERE YEAR(ngayDangKy) = :year " +
            "GROUP BY MONTH(ngayDangKy) " +
            "ORDER BY MONTH(ngayDangKy)", nativeQuery = true)
    List<Object[]> thongKeDangKyTheoThang(@Param("year") int year);
    List<DangKyHoc> findByKhoaHoc_GiaSu_IdGiaSu(String idGiaSu);
}