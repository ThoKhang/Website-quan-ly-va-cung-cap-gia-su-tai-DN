package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, String> {

    // Tính điểm đánh giá trung bình của 1 Gia sư dựa trên các lớp (DangKyHoc) đã
    // dạy
    @Query("SELECT AVG(d.soSao) FROM DanhGia d WHERE d.dangKyHoc.khoaHoc.giaSu.idGiaSu = :idGiaSu")
    Double calculateAverageRatingForGiaSu(@Param("idGiaSu") String idGiaSu);

    // 1. Tự sinh mã DG001, DG002...
    @Query("SELECT MAX(d.idDanhGia) FROM DanhGia d")
    String findMaxId();

    // 2. Kiểm tra xem Đơn đăng ký này đã được đánh giá chưa
    boolean existsByDangKyHoc_IdDangKy(String idDangKy);

    // 3. Đếm số lượng đánh giá của 1 Gia sư
    @Query("SELECT COUNT(d) FROM DanhGia d WHERE d.dangKyHoc.khoaHoc.giaSu.idGiaSu = :idGiaSu")
    Integer countRatingForGiaSu(@Param("idGiaSu") String idGiaSu);

    // 4. Đếm số lượng đánh giá của 1 Khóa học
    @Query("SELECT COUNT(d) FROM DanhGia d WHERE d.dangKyHoc.khoaHoc.idKhoaHoc = :idKhoaHoc")
    Integer countRatingForKhoaHoc(@Param("idKhoaHoc") String idKhoaHoc);

    // 5. Tính điểm đánh giá trung bình của 1 Khóa học
    @Query("SELECT AVG(d.soSao) FROM DanhGia d WHERE d.dangKyHoc.khoaHoc.idKhoaHoc = :idKhoaHoc")
    Double calculateAverageRatingForKhoaHoc(@Param("idKhoaHoc") String idKhoaHoc);

    // 6. Lấy đánh giá theo idDangKy
    Optional<DanhGia> findByDangKyHoc_IdDangKy(String idDangKy);

    // 7. Lấy tất cả đánh giá của 1 Khóa học
    java.util.List<DanhGia> findByDangKyHoc_KhoaHoc_IdKhoaHoc(String idKhoaHoc);
}