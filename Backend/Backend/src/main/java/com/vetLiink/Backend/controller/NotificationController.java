package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.NotificationDTO;
import com.vetLiink.Backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type) {
        try {
            NotificationDTO notification = notificationService.createNotification(userId, title, message, type);
            return ResponseEntity.status(201).body(notification);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }
    
    @PostMapping("/with-case")
    public ResponseEntity<NotificationDTO> createNotificationWithCase(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type,
            @RequestParam Long relatedCaseId) {
        try {
            NotificationDTO notification = notificationService.createNotificationWithRelatedCase(userId, title, message, type, relatedCaseId);
            return ResponseEntity.status(201).body(notification);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUserId(@PathVariable Long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }
    
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@PathVariable Long userId) {
        try {
            int count = notificationService.getUnreadCount(userId);
            Map<String, Integer> response = new HashMap<>();
            response.put("unreadCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        try {
            NotificationDTO notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error marking notifications as read");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Notification not found");
        }
    }
    
    @DeleteMapping("/user/{userId}/delete-all")
    public ResponseEntity<String> deleteAllNotifications(@PathVariable Long userId) {
        try {
            notificationService.deleteAllNotifications(userId);
            return ResponseEntity.ok("All notifications deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error deleting notifications");
        }
    }
}
