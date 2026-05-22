package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.TietHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TietHocRepository extends JpaRepository<TietHoc, String> {
    @Query("SELECT t.idTietHoc FROM TietHoc t ORDER BY t.idTietHoc DESC")
    List<String> findAllIdsSorted();
}