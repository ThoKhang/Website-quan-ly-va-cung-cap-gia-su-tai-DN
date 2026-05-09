package com.nhom26.tutormanagement.service;

import com.nhom26.tutormanagement.dto.BangCapRequestDTO;
import com.nhom26.tutormanagement.dto.GiaSuRequestDTO;
import com.nhom26.tutormanagement.entity.BangCap;
import com.nhom26.tutormanagement.entity.GiaSu;
import com.nhom26.tutormanagement.entity.LichDay;
import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.BangCapRepository;
import com.nhom26.tutormanagement.repository.GiaSuRepository;
import com.nhom26.tutormanagement.repository.LichDayRepository;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GiaSuService {

    private final LichDayRepository lichDayRepository;
    private final GiaSuRepository giaSuRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final BangCapRepository bangCapRepository;

    // ==========================================
    // 1. LẤY LỊCH RẢNH CỦA GIA SƯ
    // ==========================================
    public List<LichDay> layLichRanhCuaGiaSu(String idGiaSu) {
        List<LichDay> danhSachLichRanh = lichDayRepository.findByGiaSu_IdGiaSuAndTinhTrangTrue(idGiaSu);
        
        if (danhSachLichRanh.isEmpty()) {
            throw new RuntimeException("Gia sư này hiện không có lịch rảnh nào!");
        }
        
        return danhSachLichRanh;
    }

    // ==========================================
    // 2. TẠO HỒ SƠ GIA SƯ (DÙNG JWT)
    // ==========================================
    private String generateNextIdGiaSu() {
        String maxId = giaSuRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "GS001";
        return String.format("GS%03d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }

    @Transactional
    public GiaSu taoHoSo(GiaSuRequestDTO request) {
        // Lấy username từ JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Kiểm tra xem đã có hồ sơ chưa
        Optional<GiaSu> existingProfile = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername);
        if (existingProfile.isPresent()) {
            throw new RuntimeException("LỖI: Tài khoản của bạn đã có hồ sơ Gia sư!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Không tìm thấy tài khoản!"));

        GiaSu giaSuMoi = new GiaSu();
        giaSuMoi.setIdGiaSu(generateNextIdGiaSu());
        giaSuMoi.setTaiKhoan(taiKhoan);
        giaSuMoi.setTenGiaSu(request.getTenGiaSu());
        giaSuMoi.setSdt(request.getSdt());
        giaSuMoi.setCccd(request.getCccd());
        
        // Thiết lập các thông số mặc định cho hệ thống
        giaSuMoi.setNgay(LocalDateTime.now());
        giaSuMoi.setTrangThai(1); // 1 = Đang hoạt động
        giaSuMoi.setHeSoLuong(1.0);
        giaSuMoi.setLuongHienCon(0.0);

        return giaSuRepository.save(giaSuMoi);
    }

    // ==========================================
    // 3. THÊM BẰNG CẤP GIA SƯ (DÙNG JWT)
    // ==========================================
    private String generateNextIdBangCap() {
        String maxId = bangCapRepository.findMaxId();
        if (maxId == null || maxId.trim().isEmpty()) return "BC001";
        return String.format("BC%03d", Integer.parseInt(maxId.trim().substring(2)) + 1);
    }

    @Transactional
    public BangCap themBangCap(BangCapRequestDTO request) {
        // Lấy danh tính từ JWT
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Đảm bảo phải có hồ sơ Gia sư rồi mới được nộp bằng
        GiaSu giaSu = giaSuRepository.findByTaiKhoan_TenDangNhap(currentUsername)
                .orElseThrow(() -> new RuntimeException("LỖI: Bạn cần tạo hồ sơ Gia sư trước khi thêm bằng cấp!"));

        BangCap bangCapMoi = new BangCap();
        bangCapMoi.setIdBangCap(generateNextIdBangCap());
        bangCapMoi.setGiaSu(giaSu);
        bangCapMoi.setTenBangCap(request.getTenBangCap());
        bangCapMoi.setThongTinBangCap(request.getThongTinBangCap());
        bangCapMoi.setNgayCap(request.getNgayCap());
        bangCapMoi.setAnhMinhChung(request.getAnhMinhChung());
        
        // Bằng mới nộp mặc định ở trạng thái false (Chờ Admin duyệt)
        bangCapMoi.setTrangThai(false); 

        return bangCapRepository.save(bangCapMoi);
    }
}