package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.NoiDungNghi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoiDungNghiRepository extends JpaRepository<NoiDungNghi, String> {
}