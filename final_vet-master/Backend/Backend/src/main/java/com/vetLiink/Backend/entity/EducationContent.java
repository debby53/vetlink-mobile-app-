package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String contentType; // VIDEO, PDF, ARTICLE

    @Column(nullable = false, length = 500)
    private String url;

    private Long authorId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
