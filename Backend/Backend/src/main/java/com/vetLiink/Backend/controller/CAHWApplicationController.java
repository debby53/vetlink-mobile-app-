package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.ApproveApplicationRequest;
import com.vetLiink.Backend.dto.UserApplicationDTO;
import com.vetLiink.Backend.service.CAHWApplicationService;
import com.vetLiink.Backend.security.UserStatusChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for CAHW application approvals by veterinarians
 */
@RestController
@RequestMapping("/api/cahw-applications")
public class CAHWApplicationController {

    @Autowired
    private CAHWApplicationService cahwApplicationService;

    @Autowired
    private UserStatusChecker userStatusChecker;

    /**
     * Get pending CAHW applications in the same sector (for veterinarians)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> getPendingCAHWs() {
        try {
            Long vetId = userStatusChecker.getCurrentUserId();
            List<UserApplicationDTO> cahws = cahwApplicationService.getPendingCAHWsInSector(vetId);
            return ResponseEntity.ok(cahws);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Approve a CAHW application (veterinarians in same sector only)
     */
    @PostMapping("/{cahwId}/approve")
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> approveCAHW(@PathVariable Long cahwId, @RequestBody ApproveApplicationRequest request) {
        try {
            Long vetId = userStatusChecker.getCurrentUserId();
            cahwApplicationService.approveCAHW(vetId, cahwId, request);
            return ResponseEntity.ok(new SuccessResponse("CAHW approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Reject a CAHW application (veterinarians in same sector only)
     */
    @PostMapping("/{cahwId}/reject")
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> rejectCAHW(@PathVariable Long cahwId, @RequestBody ApproveApplicationRequest request) {
        try {
            Long vetId = userStatusChecker.getCurrentUserId();
            cahwApplicationService.rejectCAHW(vetId, cahwId, request);
            return ResponseEntity.ok(new SuccessResponse("CAHW rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper response classes
    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
