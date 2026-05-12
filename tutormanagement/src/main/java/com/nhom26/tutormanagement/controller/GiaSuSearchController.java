package com.nhom26.tutormanagement.controller;

import com.nhom26.tutormanagement.dto.GiaSuSearchDTO;
import com.nhom26.tutormanagement.service.GiaSuSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/giasu/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GiaSuSearchController {
    
    private final GiaSuSearchService giaSuSearchService;

    /**
     * Tìm kiếm gia sư
     * GET /api/giasu/search?keyword=toán&idMonHoc=MH001
     */
    @GetMapping
    public ResponseEntity<List<GiaSuSearchDTO>> timKiemGiaSu(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String idMonHoc) {
        
        List<GiaSuSearchDTO> result = giaSuSearchService.timKiemGiaSu(keyword, idMonHoc);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy thông tin chi tiết 1 gia sư
     * GET /api/giasu/search/{idGiaSu}
     */
    @GetMapping("/{idGiaSu}")
    public ResponseEntity<GiaSuSearchDTO> getGiaSuDetail(@PathVariable String idGiaSu) {
        GiaSuSearchDTO result = giaSuSearchService.getGiaSuDetail(idGiaSu);
        return ResponseEntity.ok(result);
    }
}
