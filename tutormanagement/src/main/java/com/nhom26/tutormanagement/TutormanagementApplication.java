package com.nhom26.tutormanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TutormanagementApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(TutormanagementApplication.class, args);
        
        // Kiểm tra xem Spring có tìm thấy biến MAIL_HOST không
        String mailHost = context.getEnvironment().getProperty("MAIL_HOST");
        System.out.println("Thư mục hiện hành: " + System.getProperty("user.dir"));
        System.out.println("=========================================");
        if (mailHost != null) {
            System.out.println("✅ KẾT NỐI .ENV THÀNH CÔNG!");
            System.out.println("Giá trị MAIL_HOST: " + mailHost);
        } else {
            System.err.println("❌ THẤT BẠI: Spring Boot không tìm thấy file .env hoặc biến MAIL_HOST");
        }
        System.out.println("=========================================");
    }
}