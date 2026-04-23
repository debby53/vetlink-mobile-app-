package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecordDTO {
    private Long id;
    private Long animalId;
    private String recordType;
    private String details;
    private String diagnosis;
    private String treatment;
    private String notes;
    private Double weight;
    private String temperature;
    private LocalDateTime recordDate;
}
