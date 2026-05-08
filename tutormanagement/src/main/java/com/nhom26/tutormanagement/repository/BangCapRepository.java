package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.BangCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BangCapRepository extends JpaRepository<BangCap, String> {
    
    // Hàm sinh ID tự động BC001, BC002...
    @Query("SELECT MAX(b.idBangCap) FROM BangCap b")
    String findMaxId();
}