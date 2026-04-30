package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PhuHuynhRepository extends JpaRepository<PhuHuynh, String> {
    // Tìm Phụ huynh dựa trên tên đăng nhập của Tài khoản (Dùng cho bảo mật JWT)
    Optional<PhuHuynh> findByTaiKhoan_TenDangNhap(String tenDangNhap);
    //
    @Query("SELECT MAX(p.idPhuHuynh) FROM PhuHuynh p")
    String findMaxId();
}