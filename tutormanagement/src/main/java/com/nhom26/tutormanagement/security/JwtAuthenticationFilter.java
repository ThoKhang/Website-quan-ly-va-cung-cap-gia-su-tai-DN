package com.nhom26.tutormanagement.security;

import com.nhom26.tutormanagement.entity.TaiKhoan;
import com.nhom26.tutormanagement.repository.TaiKhoanRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    // THÊM: Inject Repository để tìm kiếm tài khoản
    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Nếu không có Token hoặc không bắt đầu bằng Bearer -> Cho qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt); 

        // Nếu có username và chưa được xác thực trong phiên này
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            if (jwtService.isTokenValid(jwt)) { // Giả sử hàm isTokenValid của bạn chỉ nhận 1 tham số
                
                // 1. TÌM TÀI KHOẢN TRONG DB ĐỂ LẤY QUYỀN
                TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username).orElse(null);

                if (taiKhoan != null) {
                    // 2. BIẾN loaiNguoiDungID THÀNH AUTHORITY
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority(taiKhoan.getLoaiNguoiDungID())
                    );

                    // 3. TẠO PHIÊN ĐĂNG NHẬP KÈM QUYỀN (AUTHORITIES)
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, 
                            null, 
                            authorities // Đưa danh sách quyền vào đây
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}