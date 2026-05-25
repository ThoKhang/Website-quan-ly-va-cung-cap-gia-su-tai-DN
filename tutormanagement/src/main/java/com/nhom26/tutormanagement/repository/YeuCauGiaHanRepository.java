package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.YeuCauGiaHan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface YeuCauGiaHanRepository extends JpaRepository<YeuCauGiaHan, String> {
    // Lấy các đơn "Chờ duyệt" thuộc về các lớp của một Gia sư cụ thể
    List<YeuCauGiaHan> findByTrangThaiDuyetAndDangKyHoc_KhoaHoc_GiaSu_TaiKhoan_TenDangNhap(String trangThai, String tenDangNhap);
    boolean existsByDangKyHoc_IdDangKyAndTrangThaiDuyet(String idDangKy, String trangThaiDuyet);
    @Query("SELECT MAX(y.idGiaHan) FROM YeuCauGiaHan y")
    String findMaxId();
    Optional<YeuCauGiaHan> findTopByDangKyHoc_IdDangKyOrderByNgayYeuCauDesc(String idDangKy);
}