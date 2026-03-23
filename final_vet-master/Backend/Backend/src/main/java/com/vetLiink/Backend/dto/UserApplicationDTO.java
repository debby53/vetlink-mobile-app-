package com.vetLiink.Backend.dto;

import com.vetLiink.Backend.entity.UserStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserApplicationDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private UserStatus status;
    private String sector;
    private String district;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private String rejectionReason;
    private String assignedVeterinarianName;
    private Long assignedVeterinarianId;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
