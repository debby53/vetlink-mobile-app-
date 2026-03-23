package com.vetLiink.Backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    // Incoming messages sent to /app/chat
    @MessageMapping("/chat")
    @SendTo("/topic/messages") // Broadcast to all subscribers (Public Market Chat)
    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }
    
    // NOTE: For private 1-on-1 messaging (buyer <-> seller), we would use 
    // @SendToUser or SimpMessagingTemplate.convertAndSendToUser 
    // and handle principal/User stats. 
    
    // DTO for Chat
    public static class ChatMessage {
        private String sender;
        private String content;
        private LocalDateTime timestamp;
        
        // Getters and Setters
        public String getSender() { return sender; }
        public void setSender(String s) { this.sender = s; }
        public String getContent() { return content; }
        public void setContent(String c) { this.content = c; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
    }
}
