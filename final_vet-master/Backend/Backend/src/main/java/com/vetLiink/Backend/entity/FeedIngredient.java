package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "feed_ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category; // Energy, Protein, etc.

    @Column(nullable = false)
    private Double crudeProteinPercent;

    @Column(nullable = false)
    private Double energyMjPerKg;

    private BigDecimal averageCostPerKg;

    private Boolean isLocallyAvailable = true;
}
