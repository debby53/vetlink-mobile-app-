package com.vetLiink.Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.dto.MessageDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.MessageService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO messageDTO) {
        try {
            MessageDTO newMessage = messageService.sendMessage(messageDTO);
            return ResponseEntity.status(201).body(newMessage);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(@RequestParam Long userId1, @RequestParam Long userId2) {
        try {
            List<MessageDTO> messages = messageService.getConversation(userId1, userId2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/inbox/{userId}")
    public ResponseEntity<?> getInboxMessages(@PathVariable Long userId) {
        try {
            List<MessageDTO> messages = messageService.getInboxMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> getUnreadMessages(@PathVariable Long userId) {
        try {
            List<MessageDTO> messages = messageService.getUnreadMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            MessageDTO message = messageService.markAsRead(id);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMessage(@PathVariable Long id, @RequestBody MessageDTO messageDTO) {
        try {
            MessageDTO updatedMessage = messageService.updateMessage(id, messageDTO);
            return ResponseEntity.ok(updatedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id) {
        try {
            messageService.deleteMessage(id);
            return ResponseEntity.ok("Message deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Message not found");
        }
    }
}
