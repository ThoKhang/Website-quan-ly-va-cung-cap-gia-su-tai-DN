package com.nhom26.tutormanagement.config;

import com.nhom26.tutormanagement.security.JwtAuthenticationFilter;
import jakarta.servlet.Filter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 1. Chuyển sang Stateless (Chuẩn REST API + JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 2. Cho phép tự do Đăng nhập & Đăng ký
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/khoa-hoc/tim-kiem").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/khoa-hoc/{id}").permitAll()
                        .requestMatchers("/api/mon-hoc/**").permitAll()
                        .requestMatchers("/api/danh-muc-lop/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/khoa-hoc/gia-su/**").permitAll()
                        .requestMatchers("/api/khoa-hoc/**").authenticated()
                        .requestMatchers("/api/tiet-hoc", "/api/tiet-hoc/**").permitAll()
                        .requestMatchers("/api/auth/verify-otp").permitAll()
                        .requestMatchers("/api/auth/reset-password").permitAll()
                        .requestMatchers("/api/public/**", "/uploads/**").permitAll()
                        .requestMatchers("/api/dashboard/**", "/api/thongke/**").permitAll()
                        // 3. Mọi yêu cầu khác (như /api/booking/**) BẮT BUỘC phải có Token
                        .anyRequest().authenticated());

        // 4. Thêm bộ lọc JWT vào trước khi yêu cầu đi vào Controller
        // (Chúng ta sẽ viết JwtAuthenticationFilter ở bước dưới)
        http.addFilterBefore((Filter) jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Dùng allowedOriginPatterns thay vì allowedOrigins
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true); // ← bắt buộc khi dùng Authorization header

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
