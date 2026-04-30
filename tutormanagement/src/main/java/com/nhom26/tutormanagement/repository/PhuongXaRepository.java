package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.PhuongXa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhuongXaRepository extends JpaRepository<PhuongXa, String> {
}