package com.vetLiink.Backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApproveApplicationRequest {
    private Long userId;
    private Boolean approved;
    private String rejectionReason; // Only used if approved is false
}
