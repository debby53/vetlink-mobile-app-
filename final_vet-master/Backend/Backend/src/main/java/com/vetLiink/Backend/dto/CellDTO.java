package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CellDTO {
    private Long id;
    private String name;
    private String code;
    private Long villageId;
    private String villageName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
