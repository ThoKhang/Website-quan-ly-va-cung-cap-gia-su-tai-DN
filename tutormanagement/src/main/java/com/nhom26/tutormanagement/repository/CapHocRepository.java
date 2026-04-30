package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.CapHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CapHocRepository extends JpaRepository<CapHoc, String> {
}