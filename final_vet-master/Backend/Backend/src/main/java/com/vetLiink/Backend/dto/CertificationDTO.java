package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String issuedBy;
    private String description;
    private LocalDateTime issuedDate;
    private LocalDateTime expiryDate;
    private String certificateUrl;
    private Boolean isActive;
}
