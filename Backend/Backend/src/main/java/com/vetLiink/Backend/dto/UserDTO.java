package com.vetLiink.Backend.dto;

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
    private Boolean active;
    private String status;
    private Long locationId;
    private String locationName;
    private java.time.LocalDateTime createdAt;
}
