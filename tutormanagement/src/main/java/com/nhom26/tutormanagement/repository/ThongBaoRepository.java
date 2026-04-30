package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, String> {
}