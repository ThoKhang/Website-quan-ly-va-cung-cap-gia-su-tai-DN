package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.BangCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BangCapRepository extends JpaRepository<BangCap, String> {
}