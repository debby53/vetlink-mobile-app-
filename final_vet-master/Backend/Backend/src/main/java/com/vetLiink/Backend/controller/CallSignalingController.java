package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.SignalingMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CallSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle WebRTC offer from caller
     */
    @MessageMapping("/call/offer")
    public void handleOffer(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.info("📞 Received offer from {} to {}", message.getFromUserId(), message.getToUserId());
        
        // Send offer to the recipient
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getToUserId() + "/offer",
            message
        );
    }

    /**
     * Handle WebRTC answer from callee
     */
    @MessageMapping("/call/answer")
    public void handleAnswer(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.info("📞 Received answer from {} to {}", message.getFromUserId(), message.getToUserId());
        
        // Send answer back to the caller
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getToUserId() + "/answer",
            message
        );
    }

    /**
     * Handle ICE candidate exchange
     */
    @MessageMapping("/call/ice-candidate")
    public void handleIceCandidate(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.info("🧊 Received ICE candidate from {} to {}", message.getFromUserId(), message.getToUserId());
        
        // Forward ICE candidate to the other peer
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getToUserId() + "/ice-candidate",
            message
        );
    }

    /**
     * Handle call rejection
     */
    @MessageMapping("/call/reject")
    public void handleCallRejection(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.info("❌ Call rejected by {} from {}", message.getFromUserId(), message.getToUserId());
        
        // Notify the caller
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getToUserId() + "/call-rejected",
            message
        );
    }

    /**
     * Handle call end
     */
    @MessageMapping("/call/end")
    public void handleCallEnd(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.info("📵 Call ended by {}", message.getFromUserId());
        
        // Notify the other peer
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getToUserId() + "/call-ended",
            message
        );
    }

    /**
     * Handle ping/keep-alive to maintain connection
     */
    @MessageMapping("/call/ping")
    public void handlePing(@Payload SignalingMessageDTO message, StompHeaderAccessor accessor) {
        log.debug("💓 Ping from user {}", message.getFromUserId());
        
        // Echo back to keep connection alive
        messagingTemplate.convertAndSend(
            "/queue/user/" + message.getFromUserId() + "/pong",
            new SignalingMessageDTO("pong", null, message.getFromUserId(), null, null, null, null, false)
        );
    }
}
