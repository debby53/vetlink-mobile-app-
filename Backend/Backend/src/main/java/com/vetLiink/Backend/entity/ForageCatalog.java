package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "forage_catalog")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForageCatalog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String scientificName;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private String plantingSeason;
    private Integer maturityDays;
    private String recommendedSoilType;
    private String animalTypes; // Comma separated

    @Column(columnDefinition = "TEXT")
    private String supplierContacts;
}
