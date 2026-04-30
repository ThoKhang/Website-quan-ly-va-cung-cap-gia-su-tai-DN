package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.DanhMucLop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhMucLopRepository extends JpaRepository<DanhMucLop, String> {
}