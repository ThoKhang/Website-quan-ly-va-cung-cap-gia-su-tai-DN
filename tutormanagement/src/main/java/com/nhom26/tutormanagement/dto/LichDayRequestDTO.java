
package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichDayRequestDTO {
    private String idGiaSu;
    private List<String> danhSachIdTietHoc; // Danh sách ID như ["TH01", "TH02"] [7]
}