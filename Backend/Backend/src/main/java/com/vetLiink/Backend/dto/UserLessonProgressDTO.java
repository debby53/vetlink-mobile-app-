package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLessonProgressDTO {
    private Long id;
    private Long userTrainingId;
    private Long lessonId;
    private Boolean completed;
    private Integer stoppedAtSeconds;
    private LocalDateTime updatedAt;
    private Double progressPercentage;
    private String enrollmentStatus;
    private Boolean courseCompleted;
}
