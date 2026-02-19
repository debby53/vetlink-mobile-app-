package com.vetLiink.Backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    
    @JsonProperty("phone")
    private String phoneNumber;
    private Boolean active;
    private String status;
    private Long locationId;
    private String locationName;
    private java.time.LocalDateTime createdAt;
}
