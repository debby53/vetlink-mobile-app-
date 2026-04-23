package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistrictDTO {
    private Long id;
    private String name;
    private String code;
    private Long provinceId;
    private String provinceName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
