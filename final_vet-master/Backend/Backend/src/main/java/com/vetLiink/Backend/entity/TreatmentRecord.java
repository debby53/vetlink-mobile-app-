package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use simple IDs or relationships depending on if other entities exist
    // Assuming Animal and User entities exist based on context
    
    // @ManyToOne 
    // @JoinColumn(name = "animal_id")
    // private Animal animal; 
    @Column(nullable = false)
    private Long animalId; // FK reference

    @Column(nullable = false)
    private Long cahwId; // The user (CAHW) who performed it

    @Column(nullable = false)
    private Long farmVisitId; // Link to the visit workflow

    @ManyToOne
    @JoinColumn(name = "protocol_id")
    private DrugProtocol protocol;

    @Column(nullable = false)
    private String diagnosis;

    @Column(nullable = false)
    private String drugBatchNumber; // For traceability

    private Double dosageAdministered; // in ml or mg
    
    @Column(nullable = false)
    private LocalDateTime treatmentDate;

    private String nextFollowUpDate;

    // PII Protection: We do not store Farmer Name directly here if possible, 
    // relying on the FarmVisit -> Farm -> Farmer link.
    // However, we might encrypt sensitive notes.
    
    @Column(columnDefinition = "TEXT")
    private String observations;
}
