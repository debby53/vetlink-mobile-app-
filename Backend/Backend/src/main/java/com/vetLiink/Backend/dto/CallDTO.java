package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallDTO {
    private Long id;
    private Long callerId;
    private String callerName;
    private Long recipientId;
    private String recipientName;
    private String callType; // "voice" or "video"
    private String status; // "initiated", "ringing", "connected", "ended", "declined", "missed"
    private LocalDateTime initiatedAt;
    private LocalDateTime connectedAt;
    private LocalDateTime endedAt;
    private Long durationSeconds;
    private String declinationReason;
    private LocalDateTime createdAt;
}
