

package com.nhom26.tutormanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
public class TietHocDTO {
    private String idTietHoc;
    private String thu;
    private java.time.LocalTime gioBatDau;
    private java.time.LocalTime gioKetThuc;
}

