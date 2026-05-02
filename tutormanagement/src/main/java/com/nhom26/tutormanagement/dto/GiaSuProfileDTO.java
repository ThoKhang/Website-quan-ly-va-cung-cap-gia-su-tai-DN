
package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GiaSuProfileDTO {
    private String idGiaSu;
    private String tenGiaSu;
    private String anhDaiDien;
    private Integer trangThai; // 1: Đã duyệt, 0: Chờ duyệt [2, 3]
}
