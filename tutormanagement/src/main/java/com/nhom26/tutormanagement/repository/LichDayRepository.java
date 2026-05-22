package com.nhom26.tutormanagement.repository;

import com.nhom26.tutormanagement.entity.LichDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface LichDayRepository extends JpaRepository<LichDay, String> {
    // Tìm tất cả các khung giờ đang "Trống" (tinhTrang = true) của 1 Gia sư cụ thể
    // Hàm này dùng để hiển thị lịch cho Phụ huynh chọn khi book lớp
    List<LichDay> findByGiaSu_IdGiaSuAndTinhTrangIsTrue(String idGiaSu);
    
    // Tìm ID LichDay lớn nhất (sử dụng CAST để so sánh số)
    @Query("SELECT l.idLichDay FROM LichDay l ORDER BY l.idLichDay DESC")
    List<String> findAllIdsSorted();
    
    // Tìm các Lịch dạy theo mã Gia Sư và Tình trạng phải là True (Đang rảnh)
    List<LichDay> findByGiaSu_IdGiaSuAndTinhTrangTrue(String idGiaSu);
    
    //Kiểm tra xem Gia sư đã đăng ký Tiết học này chưa
    boolean existsByGiaSu_IdGiaSuAndTietHoc_IdTietHoc(String idGiaSu, String idTietHoc);
    
    // Tìm tất cả lịch dạy của gia sư
    List<LichDay> findByGiaSu_IdGiaSu(String idGiaSu);
    
    @Query("""
        SELECT kh.tenKhoaHoc, hv.tenHocVien, ph.tenPhuHuynh, ph.sdt
        FROM ChiTietLichHoc ctlh 
        JOIN ctlh.dangKyHoc dk 
        JOIN dk.khoaHoc kh 
        JOIN dk.hocVien hv 
        JOIN dk.phuHuynh ph 
        WHERE ctlh.lichDay.idLichDay = :idLichDay
        """)
    List<Object[]> findThongTinLopHocByIdLichDay(@Param("idLichDay") String idLichDay);
}