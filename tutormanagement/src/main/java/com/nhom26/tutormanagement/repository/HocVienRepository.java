package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.HocVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HocVienRepository extends JpaRepository<HocVien, String> {
    @Query("SELECT MAX(h.idHocVien) FROM HocVien h")
    String findMaxId();
}