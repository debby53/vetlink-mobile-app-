package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.UserStatusDTO;
import com.vetLiink.Backend.service.UserProfileService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {
    
    private final UserProfileService userProfileService;

    /**
     * Get current user's verification status
     */
    @GetMapping("/status")
    public ResponseEntity<UserStatusDTO> getCurrentUserStatus() {
        try {
            return ResponseEntity.ok(userProfileService.getCurrentUserStatus());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(null);
        }
    }

    /**
     * Check if current user is active
     */
    @GetMapping("/is-active")
    public ResponseEntity<Boolean> isCurrentUserActive() {
        try {
            return ResponseEntity.ok(userProfileService.isCurrentUserActive());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(false);
        }
    }

    /**
     * Get current user's assigned veterinarian (if any)
     */
    @GetMapping("/assigned-vet")
    public ResponseEntity<?> getAssignedVeterinarian() {
        try {
            Optional<UserStatusDTO> vet = userProfileService.getCurrentUserAssignedVeterinarian();
            if (vet.isPresent()) {
                return ResponseEntity.ok(vet.get());
            } else {
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(null);
        }
    }

    /**
     * Get user status by ID (any authenticated user)
     */
    @GetMapping("/status/{userId}")
    public ResponseEntity<UserStatusDTO> getUserStatus(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userProfileService.getUserStatus(userId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }
}
