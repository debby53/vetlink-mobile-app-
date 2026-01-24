package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingDTO {
    private Long id;
    private String title;
    private String description;
    private String content;
    private String category;
    private String duration; // Stores the duration string like "8 hours"
    private Integer durationHours; // Stores numeric hours for easier querying/filtering
    private Integer lessons;
    private Long instructorId;
    private String instructorName;
    private String status;
    private String videoUrl;
    private String materials;
}
