package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitDTO {
    private Long id;
    private Long caseId;
    private Long veterinarianId;
    private Long farmerId;
    private Long animalId;
    private LocalDateTime scheduledDate;
    private LocalDateTime actualDate;
    private String purpose;
    private String notes;
    private String status;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
