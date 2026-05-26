package com.nhom26.tutormanagement.scheduler;

import com.nhom26.tutormanagement.repository.ChiTietLichHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class LichHocScheduler {

    private final ChiTietLichHocRepository chiTietLichHocRepository;

    /**
     * Chạy mỗi 5 phút
     * Thứ tự quan trọng: update "Đang dạy" trước, "Đã hoàn thành" sau
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    @Transactional
    public void capNhatTrangThaiBuoiHoc() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("⏰ [Scheduler] Chạy lúc: " + now);

        try {
            // Bước 1: Cập nhật buổi đang trong giờ học → "Đang dạy"
            int dangDay = chiTietLichHocRepository.bulkUpdateDangDay(now);

            // Bước 2: Cập nhật buổi đã qua giờ kết thúc → "Đã hoàn thành"
            int hoanThanh = chiTietLichHocRepository.bulkUpdateHoanThanh(now);

            System.out.println("✅ [Scheduler] " + dangDay + " buổi → Đang dạy | "
                + hoanThanh + " buổi → Đã hoàn thành");

        } catch (Exception e) {
            System.err.println("❌ [Scheduler] Lỗi: " + e.getMessage());
        }
    }
}