package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.PhuHuynh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhuHuynhRepository extends JpaRepository<PhuHuynh, String> {
}