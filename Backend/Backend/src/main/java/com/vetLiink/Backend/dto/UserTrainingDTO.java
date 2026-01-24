package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTrainingDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private Long trainingId;
    private String trainingTitle;
    private String trainingCategory;
    private String trainingDuration;
    private Integer trainingLessons;
    private String instructorName;
    private String status;
    private Double progressPercentage;
    private Integer score;
    private String enrolledAt;
    private String completedAt;
    private String videoUrl;
}
