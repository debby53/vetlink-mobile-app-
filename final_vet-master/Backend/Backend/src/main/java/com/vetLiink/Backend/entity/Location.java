package com.vetLiink.Backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locations")
@Getter
@Setter
@ToString(exclude = "parentLocation")
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ELocationType type;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_location_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Location parentLocation;

    @Column(name = "display_name")
    private String displayName;

    public Location(ELocationType type, String name, String code, Location parentLocation, String displayName) {
        this.type = type;
        this.name = name;
        this.code = code;
        this.parentLocation = parentLocation;
        this.displayName = displayName != null ? displayName : name;
    }
}
