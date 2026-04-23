package com.vetLiink.Backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "calls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "caller_id", nullable = false)
    private User caller;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String callType; // "voice" or "video"

    @Column(nullable = false)
    private String status; // "initiated", "ringing", "connected", "ended", "declined", "missed"

    private LocalDateTime initiatedAt;
    private LocalDateTime connectedAt;
    private LocalDateTime endedAt;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    private String declinationReason; // "busy", "declined", "no_answer", etc.

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        initiatedAt = LocalDateTime.now();
        if (status == null) {
            status = "initiated";
        }
    }

    // Convenient methods
    public Long getDuration() {
        if (connectedAt != null && endedAt != null) {
            return java.time.temporal.ChronoUnit.SECONDS.between(connectedAt, endedAt);
        }
        return 0L;
    }

    public boolean isActive() {
        return "ringing".equals(status) || "connected".equals(status);
    }
}
