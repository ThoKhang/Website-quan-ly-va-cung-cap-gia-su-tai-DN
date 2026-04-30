package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.PhanQuyenNguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhanQuyenNguoiDungRepository extends JpaRepository<PhanQuyenNguoiDung, String> {
}