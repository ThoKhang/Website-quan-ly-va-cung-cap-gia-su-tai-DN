package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.GiaSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiaSuRepository extends JpaRepository<GiaSu, String> {
    // Tìm các gia sư đã qua xét duyệt (Lọc kép thành công)
    // Giả sử trạng thái 2 là "Đã duyệt"
    List<GiaSu> findByTrangThai(Integer trangThai);
}