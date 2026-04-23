package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectorDTO {
    private Long id;
    private String name;
    private String code;
    private Long districtId;
    private String districtName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
