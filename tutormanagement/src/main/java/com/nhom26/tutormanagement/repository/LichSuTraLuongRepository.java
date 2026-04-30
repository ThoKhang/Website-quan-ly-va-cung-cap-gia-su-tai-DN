package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.LichSuTraLuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuTraLuongRepository extends JpaRepository<LichSuTraLuong, String> {
}