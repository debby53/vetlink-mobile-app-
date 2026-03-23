package com.vetLiink.Backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private Long locationId;
    
    // New fields for verification workflow
    private String sector;
    private String district;
    
    // For veterinarians
    private String phone;
    private String specialization;
    private String licenseNumber;
    private String licenseVerificationDocumentUrl;
}
