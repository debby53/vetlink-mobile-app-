package com.vetLiink.Backend.dto;

import com.vetLiink.Backend.entity.UserStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private UserStatus status;
    private String statusDescription;
    private String sector;
    private String district;
    private String assignedVeterinarianName;
    private String rejectionReason;
}
