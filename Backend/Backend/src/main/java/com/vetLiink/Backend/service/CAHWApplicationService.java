package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.ApproveApplicationRequest;
import com.vetLiink.Backend.dto.UserApplicationDTO;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for CAHW application approvals by veterinarians in the same sector
 */
@Service
public class CAHWApplicationService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all pending CAHW applications in the same sector as the veterinarian
     */
    public List<UserApplicationDTO> getPendingCAHWsInSector(Long vetId) {
        // Get the veterinarian's sector
        User veterinarian = userRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        if (veterinarian.getRole() != User.UserRole.VETERINARIAN) {
            throw new RuntimeException("Only veterinarians can view CAHW applications");
        }

        String vetSector = veterinarian.getSector();
        if (vetSector == null || vetSector.isEmpty()) {
            throw new RuntimeException("Veterinarian sector not set");
        }

        // Get all pending CAHWs in the same sector using the correct repository method
        return userRepository.findCahwsByStatusAndSector(UserStatus.PENDING_VERIFICATION, vetSector)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Approve a CAHW application as a veterinarian in the same sector
     */
    @Transactional
    public void approveCAHW(Long vetId, Long cahwId, ApproveApplicationRequest request) {
        User veterinarian = userRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        User cahw = userRepository.findById(cahwId)
                .orElseThrow(() -> new RuntimeException("CAHW not found"));

        // Verify veterinarian is in the same sector
        if (!veterinarian.getSector().equals(cahw.getSector())) {
            throw new RuntimeException("Cannot approve CAHW from a different sector");
        }

        // Verify CAHW is pending
        if (cahw.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("CAHW is not pending approval");
        }

        // Update CAHW status
        cahw.setStatus(UserStatus.ACTIVE);
        cahw.setApprovedBy(veterinarian);
        cahw.setApprovedAt(LocalDateTime.now());
        userRepository.save(cahw);
    }

    /**
     * Reject a CAHW application as a veterinarian in the same sector
     */
    @Transactional
    public void rejectCAHW(Long vetId, Long cahwId, ApproveApplicationRequest request) {
        User veterinarian = userRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        User cahw = userRepository.findById(cahwId)
                .orElseThrow(() -> new RuntimeException("CAHW not found"));

        // Verify veterinarian is in the same sector
        if (!veterinarian.getSector().equals(cahw.getSector())) {
            throw new RuntimeException("Cannot reject CAHW from a different sector");
        }

        // Verify CAHW is pending
        if (cahw.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("CAHW is not pending approval");
        }

        // Update CAHW status to SUSPENDED and store rejection reason
        cahw.setStatus(UserStatus.SUSPENDED);
        cahw.setRejectionReason(request.getRejectionReason());
        cahw.setApprovedBy(veterinarian);
        cahw.setApprovedAt(LocalDateTime.now());
        userRepository.save(cahw);
    }

    private UserApplicationDTO convertToDTO(User user) {
        UserApplicationDTO dto = new UserApplicationDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        // Convert Enum to String for DTO
        dto.setRole(user.getRole().name());
        // Pass Enum directly since DTO expects UserStatus
        dto.setStatus(user.getStatus());
        dto.setSector(user.getSector());
        dto.setDistrict(user.getDistrict());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRejectionReason(user.getRejectionReason());
        return dto;
    }
}
