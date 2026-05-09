package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.GiaSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Nhớ import cái này
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

    // THÊM HÀM NÀY: Để hệ thống tự động tìm mã ID lớn nhất (sinh mã GS001, GS002...)
    @Query("SELECT MAX(g.idGiaSu) FROM GiaSu g")
    String findMaxId();
}