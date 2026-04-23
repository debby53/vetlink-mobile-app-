package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "drug_protocols")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrugProtocol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String conditionName; // e.g., "Mastitis"

    @Column(nullable = false)
    private String drugName; // e.g., "Penicillin"

    @Column(nullable = false)
    private String dosageGuide; // e.g., "1ml per 20kg"

    @Column(nullable = false)
    private String routeOfAdministration; // "IM", "SC", "Oral"

    private Integer withdrawalPeriodMilkDays;
    private Integer withdrawalPeriodMeatDays;

    @Column(length = 1000)
    private String notes; // Contraindications, etc.
}
