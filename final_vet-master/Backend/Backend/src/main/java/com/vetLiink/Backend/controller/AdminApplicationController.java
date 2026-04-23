package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.UserApplicationDTO;
import com.vetLiink.Backend.dto.ApproveApplicationRequest;
import com.vetLiink.Backend.service.AdminApplicationService;
import com.vetLiink.Backend.entity.UserStatus;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/applications")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AdminApplicationController {
    
    private final AdminApplicationService adminApplicationService;

    /**
     * Get all pending applications (admin only)
     */
    @GetMapping("/pending")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<List<UserApplicationDTO>> getPendingApplications() {
        try {
            return ResponseEntity.ok(adminApplicationService.getPendingApplications());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get all applications by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<List<UserApplicationDTO>> getApplicationsByStatus(@PathVariable String status) {
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(adminApplicationService.getApplicationsByStatus(userStatus));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    /**
     * Get all CAHW applications
     */
    @GetMapping("/cahws")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<List<UserApplicationDTO>> getCahwApplications() {
        try {
            return ResponseEntity.ok(adminApplicationService.getCahwApplications());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get all veterinarian applications
     */
    @GetMapping("/veterinarians")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<List<UserApplicationDTO>> getVeterinarianApplications() {
        try {
            return ResponseEntity.ok(adminApplicationService.getVeterinarianApplications());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get applications by sector
     */
    @GetMapping("/sector/{sector}")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<List<UserApplicationDTO>> getApplicationsBySector(@PathVariable String sector) {
        try {
            return ResponseEntity.ok(adminApplicationService.getApplicationsBySector(sector));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Approve a user application (set status to TRAINING_REQUIRED or ACTIVE based on role)
     */
    @PostMapping("/approve")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<UserApplicationDTO> approveApplication(@RequestBody ApproveApplicationRequest request) {
        try {
            UserApplicationDTO result = adminApplicationService.approveApplication(request.getUserId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    /**
     * Reject a user application
     */
    @PostMapping("/reject")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<UserApplicationDTO> rejectApplication(@RequestBody ApproveApplicationRequest request) {
        try {
            if (request.getRejectionReason() == null || request.getRejectionReason().isEmpty()) {
                return ResponseEntity.status(400).body(null);
            }
            UserApplicationDTO result = adminApplicationService.rejectApplication(
                request.getUserId(), 
                request.getRejectionReason()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    /**
     * Suspend a user account
     */
    @PostMapping("/suspend/{userId}")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<UserApplicationDTO> suspendUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminApplicationService.suspendUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    /**
     * Activate a user (when ready)
     */
    @PostMapping("/activate/{userId}")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<UserApplicationDTO> activateUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminApplicationService.activateUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    /**
     * Assign a veterinarian to a CAHW
     */
    @PostMapping("/assign-vet")
    @PreAuthorize("@userStatusChecker.isAdmin()")
    public ResponseEntity<UserApplicationDTO> assignVeterinarian(
        @RequestParam Long cahwId, 
        @RequestParam Long vetId) {
        try {
            return ResponseEntity.ok(adminApplicationService.assignVeterinarian(cahwId, vetId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }
}
