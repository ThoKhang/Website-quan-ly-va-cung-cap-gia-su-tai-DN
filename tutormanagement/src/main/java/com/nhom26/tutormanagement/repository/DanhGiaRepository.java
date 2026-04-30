package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, String> {
    
    // Tính điểm đánh giá trung bình của 1 Gia sư dựa trên các lớp (DangKyHoc) đã dạy
    @Query("SELECT AVG(d.soSao) FROM DanhGia d WHERE d.dangKyHoc.khoaHoc.giaSu.idGiaSu = :idGiaSu")
    Double calculateAverageRatingForGiaSu(@Param("idGiaSu") String idGiaSu);
}