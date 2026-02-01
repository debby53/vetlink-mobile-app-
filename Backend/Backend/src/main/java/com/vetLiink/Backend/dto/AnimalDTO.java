package com.vetLiink.Backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnimalDTO {
    private Long id;
    private String name;
    private String type;
    private String breed;
    private Integer age;
    private String gender;
    private Long farmerId;
    private String healthStatus;
    private Double weight;
    private String specificAttributes;
}
