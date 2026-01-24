package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.CallDTO;
import com.vetLiink.Backend.entity.Call;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.CallRepository;
import com.vetLiink.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CallService {
    
    private final CallRepository callRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Initiate a new call
     */
    public CallDTO initiateCall(Long callerId, Long recipientId, String callType) {
        try {
            log.info("📞 Initiating {} call from {} to {}", callType, callerId, recipientId);
            
            if (callerId == null || recipientId == null || callType == null) {
                log.error("❌ Missing parameters: callerId={}, recipientId={}, callType={}", callerId, recipientId, callType);
                throw new RuntimeException("Missing required parameters");
            }
            
            if (callerId.equals(recipientId)) {
                log.warn("⚠️ User {} attempted to call themselves", callerId);
                throw new RuntimeException("Cannot call yourself");
            }
            
            User caller = userRepository.findById(callerId)
                .orElseThrow(() -> {
                    log.error("❌ Caller not found with ID: {}", callerId);
                    return new RuntimeException("Caller not found");
                });
            
            User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> {
                    log.error("❌ Recipient not found with ID: {}", recipientId);
                    return new RuntimeException("Recipient not found");
                });

            log.info("✅ Found users: caller={} ({}), recipient={} ({})", caller.getId(), caller.getName(), recipient.getId(), recipient.getName());

            // Check if there's already an active call between them
            List<Call> activeCalls = callRepository.findActiveCalls(callerId);
            log.debug("Found {} active calls for user {}", activeCalls.size(), callerId);
            
            for (Call call : activeCalls) {
                if ((call.getRecipient().getId().equals(recipientId) || call.getCaller().getId().equals(recipientId)) 
                    && call.isActive()) {
                    log.warn("⚠️ Already in active call between {} and {}", callerId, recipientId);
                    throw new RuntimeException("Already in a call with this user");
                }
            }

            Call call = Call.builder()
                .caller(caller)
                .recipient(recipient)
                .callType(callType)
                .status("initiated")
                .initiatedAt(LocalDateTime.now())
                .build();

            Call savedCall = callRepository.save(call);
            log.info("✅ Call created with ID: {}", savedCall.getId());

            // Send notification to recipient
            notificationService.createNotification(
                recipientId,
                caller.getName() + " is calling...",
                "Incoming " + callType + " call from " + caller.getName(),
                "CALL"
            );

            log.info("✅ Notification sent to recipient");
            // Use the caller and recipient objects we already have instead of calling mapToDTO with savedCall relationships
            return mapToDTO(savedCall, caller, recipient);
        } catch (Exception e) {
            log.error("❌ Error initiating call: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Accept an incoming call
     */
    public CallDTO acceptCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        if (!call.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Only the recipient can accept this call");
        }

        if (!call.getStatus().equals("initiated") && !call.getStatus().equals("ringing")) {
            throw new RuntimeException("Call cannot be accepted in its current state");
        }

        call.setStatus("connected");
        call.setConnectedAt(LocalDateTime.now());
        Call savedCall = callRepository.save(call);

        return mapToDTO(savedCall, call.getCaller(), call.getRecipient());
    }

    /**
     * Decline/reject a call
     */
    public CallDTO declineCall(Long callId, Long userId, String reason) {
        Call call = callRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        if (!call.getRecipient().getId().equals(userId) && !call.getCaller().getId().equals(userId)) {
            throw new RuntimeException("You are not part of this call");
        }

        call.setStatus("declined");
        call.setDeclinationReason(reason != null ? reason : "declined");
        call.setEndedAt(LocalDateTime.now());
        Call savedCall = callRepository.save(call);

        return mapToDTO(savedCall, call.getCaller(), call.getRecipient());
    }

    /**
     * End an active call
     */
    public CallDTO endCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        if (!call.getCaller().getId().equals(userId) && !call.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("You are not part of this call");
        }

        if (!call.isActive()) {
            throw new RuntimeException("Call is not active");
        }

        call.setStatus("ended");
        call.setEndedAt(LocalDateTime.now());
        call.setDurationSeconds(call.getDuration());

        Call savedCall = callRepository.save(call);
        return mapToDTO(savedCall, call.getCaller(), call.getRecipient());
    }

    /**
     * Get incoming calls for a user
     */
    public List<CallDTO> getIncomingCalls(Long userId) {
        List<Call> calls = callRepository.findIncomingCalls(userId);
        return calls.stream()
            .map(call -> mapToDTO(call, call.getCaller(), call.getRecipient()))
            .collect(Collectors.toList());
    }

    /**
     * Get call history between two users
     */
    public List<CallDTO> getCallHistory(Long userId1, Long userId2) {
        List<Call> calls = callRepository.findCallHistory(userId1, userId2);
        return calls.stream()
            .map(call -> mapToDTO(call, call.getCaller(), call.getRecipient()))
            .collect(Collectors.toList());
    }

    /**
     * Get a specific call
     */
    public CallDTO getCall(Long callId) {
        Call call = callRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));
        return mapToDTO(call, call.getCaller(), call.getRecipient());
    }

    /**
     * Get missed calls for a user
     */
    public List<CallDTO> getMissedCalls(Long userId) {
        // Mark ringing calls as missed if they haven't been accepted
        List<Call> allRingingCalls = callRepository.findIncomingCalls(userId);
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        
        for (Call call : allRingingCalls) {
            if (call.getInitiatedAt().isBefore(fiveMinutesAgo) && call.getStatus().equals("ringing")) {
                call.setStatus("missed");
                call.setEndedAt(LocalDateTime.now());
                callRepository.save(call);
            }
        }

        List<Call> missedCalls = callRepository.findMissedCalls(userId);
        return missedCalls.stream()
            .map(call -> mapToDTO(call, call.getCaller(), call.getRecipient()))
            .collect(Collectors.toList());
    }

    /**
     * Update call status to ringing (when recipient's phone rings)
     */
    public CallDTO markAsRinging(Long callId) {
        Call call = callRepository.findById(callId)
            .orElseThrow(() -> new RuntimeException("Call not found"));

        if (call.getStatus().equals("initiated")) {
            call.setStatus("ringing");
            Call savedCall = callRepository.save(call);
            return mapToDTO(savedCall, call.getCaller(), call.getRecipient());
        }

        return mapToDTO(call, call.getCaller(), call.getRecipient());
    }

    /**
     * Map Call entity to DTO
     */
    private CallDTO mapToDTO(Call call, User caller, User recipient) {
        return CallDTO.builder()
            .id(call.getId())
            .callerId(caller.getId())
            .callerName(caller.getName())
            .recipientId(recipient.getId())
            .recipientName(recipient.getName())
            .callType(call.getCallType())
            .status(call.getStatus())
            .initiatedAt(call.getInitiatedAt())
            .connectedAt(call.getConnectedAt())
            .endedAt(call.getEndedAt())
            .durationSeconds(call.getDurationSeconds())
            .declinationReason(call.getDeclinationReason())
            .createdAt(call.getCreatedAt())
            .build();
    }
}
