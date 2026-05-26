package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.dto.GiaSuLuongAdminDTO;
import com.nhom26.tutormanagement.entity.GiaSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Nhớ import cái này
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiaSuRepository extends JpaRepository<GiaSu, String> {
    
    // Tìm các gia sư đã qua xét duyệt (Lọc kép thành công)
    // Giả sử trạng thái 2 là "Đã duyệt"
    List<GiaSu> findByTrangThai(Integer trangThai);

    // Để lấy hồ sơ Gia sư thông qua Username (từ JWT)
    Optional<GiaSu> findByTaiKhoan_TenDangNhap(String tenDangNhap);

    // Tìm GiaSu từ TaiKhoan ID
    Optional<GiaSu> findByTaiKhoan_IdTaiKhoan(String idTaiKhoan);

    // THÊM HÀM NÀY: Để hệ thống tự động tìm mã ID lớn nhất (sinh mã GS001, GS002...)
    @Query("SELECT MAX(g.idGiaSu) FROM GiaSu g")
    String findMaxId();

    // Tìm kiếm gia sư theo tên hoặc môn học
    @Query("""
        SELECT DISTINCT gs
        FROM GiaSu gs
        LEFT JOIN gs.taiKhoan tk
        LEFT JOIN KhoaHoc kh ON kh.giaSu.idGiaSu = gs.idGiaSu
        LEFT JOIN kh.monHoc mh
        WHERE (:keyword IS NULL OR
               LOWER(gs.tenGiaSu) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(mh.tenMonHoc, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:idMonHoc IS NULL OR mh.idMonHoc = :idMonHoc)
        ORDER BY gs.idGiaSu DESC
        """)
    List<GiaSu> timKiemGiaSu(
            @Param("keyword") String keyword,
            @Param("idMonHoc") String idMonHoc);
    
    @Query("SELECT new com.nhom26.tutormanagement.dto.GiaSuLuongAdminDTO(" +
       "g.idGiaSu, g.tenGiaSu, t.nganHang, t.stk, g.luongHienCon) " +
       "FROM GiaSu g JOIN g.taiKhoan t " +
       "WHERE g.luongHienCon > 0 " +
       "ORDER BY g.luongHienCon DESC")
    List<GiaSuLuongAdminDTO> findDanhSachTraLuong();
}
