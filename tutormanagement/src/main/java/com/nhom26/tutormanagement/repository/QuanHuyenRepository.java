package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.QuanHuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuanHuyenRepository extends JpaRepository<QuanHuyen, String> {
}