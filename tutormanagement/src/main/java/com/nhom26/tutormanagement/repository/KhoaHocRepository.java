package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.KhoaHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface KhoaHocRepository extends JpaRepository<KhoaHoc, String> {
    
    // Tìm kiếm cơ bản theo tên (có chứa từ khóa, không phân biệt hoa thường)
    List<KhoaHoc> findByTenKhoaHocContainingIgnoreCase(String keyword);

    // Tìm kiếm kết hợp (Môn học, Lớp, Mức giá tối đa)
    List<KhoaHoc> findByMonHoc_IdMonHocAndDanhMucLop_IdDanhMucLopAndSoTienHocLessThanEqual(
            String idMonHoc, String idDanhMucLop, BigDecimal maxPrice);
}