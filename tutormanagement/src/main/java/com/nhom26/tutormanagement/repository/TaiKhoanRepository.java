package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    // Hàm này được AuthService gọi để kiểm tra lúc đăng nhập
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
}