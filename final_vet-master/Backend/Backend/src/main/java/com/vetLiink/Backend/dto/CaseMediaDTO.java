package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseMediaDTO {
    private Long id;
    private Long caseId;
    private String mediaType;  // IMAGE or VIDEO
    private String fileUrl;
    private String fileName;
    private String description;
    private Long fileSizeBytes;
    private LocalDateTime uploadedAt;
    private Long uploadedByUserId;
}
