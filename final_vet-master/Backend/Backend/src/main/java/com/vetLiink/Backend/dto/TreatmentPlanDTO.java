package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlanDTO {
    private Long id;
    private Long caseId;
    private Long veterinarianId;
    private String treatment;
    private String notes;
    private Integer duration;
    private Double compliance;
    private String status;
    private String activityType;
    private String startDate;
    private String createdAt;
}
