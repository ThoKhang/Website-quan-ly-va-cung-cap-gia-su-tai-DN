package com.nhom26.tutormanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ toàn bộ request bắt đầu bằng /uploads/** đi thẳng vào thư mục vật lý uploads/ ngoài ổ đĩa
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}