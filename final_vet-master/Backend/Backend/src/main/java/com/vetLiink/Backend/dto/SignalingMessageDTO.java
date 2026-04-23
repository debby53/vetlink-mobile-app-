package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebRTC signaling messages
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalingMessageDTO {
    private String type; // "offer", "answer", "ice-candidate", "call-rejected", "call-ended"
    private Long fromUserId;
    private Long toUserId;
    private Long callId;
    private String sdp; // Session Description Protocol
    private IceCandidateDTO iceCandidate;
    private String message; // For error or status messages
    private Boolean videoEnabled; // Whether to enable video
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IceCandidateDTO {
        private String candidate;
        private String sdpMLineIndex;
        private String sdpMid;
    }
}
