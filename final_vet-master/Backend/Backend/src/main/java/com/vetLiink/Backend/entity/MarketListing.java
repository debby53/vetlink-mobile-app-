package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketListing {

    public enum ListingStatus {
        ACTIVE, SOLD, EXPIRED
    }

    public enum ListingType {
        ANIMAL, PRODUCE, INPUT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String location; // Could be simple string or separate Entity

    @Enumerated(EnumType.STRING)
    private ListingType type;

    @Enumerated(EnumType.STRING)
    private ListingStatus status = ListingStatus.ACTIVE;

    private String imageUrl;

    @Column(nullable = false)
    private Long sellerId; // Link to User

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt;
    
    // For Full-Text Search efficiency, sometimes we store a tsvector column, 
    // but here we define the fields for the repository to query.
}
