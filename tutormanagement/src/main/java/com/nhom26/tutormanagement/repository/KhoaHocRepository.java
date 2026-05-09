package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.KhoaHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface KhoaHocRepository extends JpaRepository<KhoaHoc, String> {
    @Query("""
        SELECT kh
        FROM KhoaHoc kh
        LEFT JOIN kh.monHoc mh
        LEFT JOIN kh.danhMucLop dml
        LEFT JOIN kh.giaSu gs
        WHERE (:keyword IS NULL OR
               LOWER(kh.tenKhoaHoc) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(kh.moTa, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(kh.yeuCau, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(kh.noiDungKhoaHoc, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(mh.tenMonHoc, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(dml.tenLop, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(COALESCE(gs.tenGiaSu, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:idMonHoc IS NULL OR mh.idMonHoc = :idMonHoc)
          AND (:idDanhMucLop IS NULL OR dml.idDanhMucLop = :idDanhMucLop)
          AND (:minPrice IS NULL OR kh.soTienHoc >= :minPrice)
          AND (:maxPrice IS NULL OR kh.soTienHoc <= :maxPrice)
        """)
    List<KhoaHoc> timKiemVaLoc(
            @Param("keyword") String keyword,
            @Param("idMonHoc") String idMonHoc,
            @Param("idDanhMucLop") String idDanhMucLop,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
}
