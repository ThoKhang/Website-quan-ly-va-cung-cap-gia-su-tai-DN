package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.ChiTietLichHoc;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChiTietLichHocRepository extends JpaRepository<ChiTietLichHoc, String> {
    // Tìm chi tiết lịch học dựa theo ID của phiếu đăng ký
    List<ChiTietLichHoc> findByDangKyHoc_IdDangKy(String idDangKy);
    //
    @Query("SELECT MAX(c.idLichHoc) FROM ChiTietLichHoc c")
    String findMaxId();
    
    // Hàm đếm số buổi đã nghỉ
    long countByDangKyHoc_IdDangKyAndTinhTrang(String idDangKy, String tinhTrang);
    
    @Modifying
    @Query(value = """
        UPDATE ChiTietLichHoc
        SET tinhTrang = N'Đang dạy'
        WHERE tinhTrang = N'Chưa bắt đầu'
        AND DATEADD(
            MINUTE,
            DATEDIFF(MINUTE, '00:00:00',
                (SELECT th.gioBatDau FROM TietHoc th
                 JOIN LichDay ld ON ld.idTietHoc = th.idTietHoc
                 WHERE ld.idLichDay = ChiTietLichHoc.idLichDay)),
            CAST(CAST(ngayHoc AS DATE) AS DATETIME)
        ) <= :now
        AND DATEADD(
            MINUTE,
            DATEDIFF(MINUTE, '00:00:00',
                (SELECT th.gioKetThuc FROM TietHoc th
                 JOIN LichDay ld ON ld.idTietHoc = th.idTietHoc
                 WHERE ld.idLichDay = ChiTietLichHoc.idLichDay)),
            CAST(CAST(ngayHoc AS DATE) AS DATETIME)
        ) > :now
        """, nativeQuery = true)
    int bulkUpdateDangDay(@Param("now") LocalDateTime now);

    @Modifying
    @Query(value = """
        UPDATE ChiTietLichHoc
        SET tinhTrang = N'Đã hoàn thành'
        WHERE tinhTrang IN (N'Chưa bắt đầu', N'Đang dạy')
        AND DATEADD(
            MINUTE,
            DATEDIFF(MINUTE, '00:00:00',
                (SELECT th.gioKetThuc FROM TietHoc th
                 JOIN LichDay ld ON ld.idTietHoc = th.idTietHoc
                 WHERE ld.idLichDay = ChiTietLichHoc.idLichDay)),
            CAST(CAST(ngayHoc AS DATE) AS DATETIME)
        ) <= :now
        """, nativeQuery = true)
    int bulkUpdateHoanThanh(@Param("now") LocalDateTime now);
}