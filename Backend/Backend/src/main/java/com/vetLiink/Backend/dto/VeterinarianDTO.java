package com.vetLiink.Backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VeterinarianDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private Boolean active;
    private Long locationId;
    private String locationName;
    private Integer activeCases;
    private Integer totalCasesResolved;
    private Double averageResponseTime; // in hours
    private String registrationDate;
}
