package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.CallDTO;
import com.vetLiink.Backend.service.CallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
@Slf4j
public class CallController {

    private final CallService callService;

    /**
     * Initiate a new call
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateCall(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            log.info("📞 Call initiate request received. Auth: {}", authentication != null ? authentication.getName() : "null");
            log.info("📞 Request body: {}", request);
            
            if (authentication == null) {
                log.error("❌ Authentication is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            
            if (request == null || request.isEmpty()) {
                log.error("❌ Request body is empty or null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Request body is empty"));
            }
            
            Object recipientIdObj = request.get("recipientId");
            Object callTypeObj = request.get("callType");
            
            if (recipientIdObj == null) {
                log.error("❌ Missing recipientId in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing recipientId"));
            }
            
            if (callTypeObj == null) {
                log.error("❌ Missing callType in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing callType"));
            }
            
            Long callerId = Long.parseLong(authentication.getName());
            Long recipientId = ((Number) recipientIdObj).longValue();
            String callType = (String) callTypeObj;
            
            log.info("📞 Initiating {} call from {} to {}", callType, callerId, recipientId);

            CallDTO call = callService.initiateCall(callerId, recipientId, callType);
            log.info("✅ Call initiated successfully: {}", call.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(call);
        } catch (NumberFormatException e) {
            log.error("❌ Number format error in call initiate: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid number format: " + e.getMessage()));
        } catch (NullPointerException e) {
            log.error("❌ Null pointer error - missing required fields in request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Null pointer error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error initiating call: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Accept an incoming call
     */
    @PostMapping("/{callId}/accept")
    public ResponseEntity<CallDTO> acceptCall(
            @PathVariable Long callId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            CallDTO call = callService.acceptCall(callId, userId);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Decline/reject a call
     */
    @PostMapping("/{callId}/decline")
    public ResponseEntity<CallDTO> declineCall(
            @PathVariable Long callId,
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            String reason = request != null ? request.get("reason") : null;
            CallDTO call = callService.declineCall(callId, userId, reason);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * End an active call
     */
    @PostMapping("/{callId}/end")
    public ResponseEntity<CallDTO> endCall(
            @PathVariable Long callId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            CallDTO call = callService.endCall(callId, userId);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get incoming calls
     */
    @GetMapping("/incoming")
    public ResponseEntity<List<CallDTO>> getIncomingCalls(Authentication authentication) {
        try {
            if (authentication == null) {
                System.err.println("❌ No authentication in incoming calls endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Long userId = Long.parseLong(authentication.getName());
            System.out.println("✅ Getting incoming calls for user: " + userId);
            List<CallDTO> calls = callService.getIncomingCalls(userId);
            return ResponseEntity.ok(calls);
        } catch (NumberFormatException e) {
            System.err.println("❌ NumberFormatException in incoming calls: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            System.err.println("❌ Exception in incoming calls: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get call history with a specific user
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<CallDTO>> getCallHistory(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            Long currentUserId = Long.parseLong(authentication.getName());
            List<CallDTO> calls = callService.getCallHistory(currentUserId, userId);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get a specific call
     */
    @GetMapping("/{callId}")
    public ResponseEntity<CallDTO> getCall(
            @PathVariable Long callId,
            Authentication authentication) {
        try {
            CallDTO call = callService.getCall(callId);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get missed calls
     */
    @GetMapping("/missed")
    public ResponseEntity<List<CallDTO>> getMissedCalls(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<CallDTO> calls = callService.getMissedCalls(userId);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Mark a call as ringing
     */
    @PostMapping("/{callId}/ringing")
    public ResponseEntity<CallDTO> markAsRinging(@PathVariable Long callId) {
        try {
            CallDTO call = callService.markAsRinging(callId);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
