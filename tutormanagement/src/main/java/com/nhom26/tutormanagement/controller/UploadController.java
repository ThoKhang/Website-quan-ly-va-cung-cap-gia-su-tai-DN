package com.nhom26.tutormanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class UploadController {

    // Thư mục lưu trữ ảnh ngay tại thư mục gốc của dự án Backend
    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn một file ảnh!"));
        }

        try {
            // Tự động tạo thư mục uploads/ nếu hệ thống chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Trích xuất đuôi mở rộng của file (.jpg, .png, ...)
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Đổi tên file thành mã ngẫu nhiên UUID để tránh trùng tên khi nhiều người
            // upload
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Tiến hành copy và lưu file vào thư mục vật lý
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Tạo đường dẫn URL tĩnh để Frontend truy cập xem ảnh công khai
            String fileUrl = "/uploads/" + uniqueFileName;

            return ResponseEntity.ok(Map.of("fileUrl", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi lưu file: " + e.getMessage()));
        }
    }
}