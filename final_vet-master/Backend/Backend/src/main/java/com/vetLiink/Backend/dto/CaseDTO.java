package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseDTO {
    private Long id;
    private Long farmerId;
    private Long animalId;
    private Long veterinarianId;
    private Long cahwId;
    private Long locationId;
    private String locationName;
    private String farmerName;
    private String animalName;
    private String animalType;
    private String title;
    private String description;
    private String caseType;
    private String status;
    private Double severity;
    private String diagnosis;
    private String treatment;
    private String resolution;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private Boolean isEscalated;
    private LocalDateTime escalatedAt;
    private String escalationReason;
    private List<CaseMediaDTO> media;
}
