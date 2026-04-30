package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.TietHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TietHocRepository extends JpaRepository<TietHoc, String> {
}