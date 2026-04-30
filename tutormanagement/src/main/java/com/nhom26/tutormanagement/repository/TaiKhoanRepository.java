package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    
    // Spring Data JPA sẽ tự động dịch câu này thành: 
    // SELECT * FROM TaiKhoan WHERE tenDangNhap = ? OR email = ?
    Optional<TaiKhoan> findByTenDangNhapOrEmail(String tenDangNhap, String email);
}