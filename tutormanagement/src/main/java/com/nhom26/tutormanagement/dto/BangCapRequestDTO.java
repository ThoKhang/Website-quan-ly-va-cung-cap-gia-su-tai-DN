package com.nhom26.tutormanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BangCapRequestDTO {
    private String tenBangCap;
    private String thongTinBangCap;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngayCap;
    
    private String anhMinhChung;
}