package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.UserApplicationDTO;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.repository.VeterinarianRepository;
import com.vetLiink.Backend.security.UserStatusChecker;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminApplicationService {
    
    private final UserRepository userRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final UserStatusChecker userStatusChecker;

    /**
     * Convert User to UserApplicationDTO
     */
    private UserApplicationDTO convertToDTO(User user) {
        return UserApplicationDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .status(user.getStatus())
                .sector(user.getSector())
                .district(user.getDistrict())
                .phone(user.getAssignedVeterinarian() != null ? 
                    user.getAssignedVeterinarian().getName() : null)
                .assignedVeterinarianName(user.getAssignedVeterinarian() != null ? 
                    user.getAssignedVeterinarian().getName() : null)
                .assignedVeterinarianId(user.getAssignedVeterinarian() != null ? 
                    user.getAssignedVeterinarian().getId() : null)
                .rejectionReason(user.getRejectionReason())
                .approvedByName(user.getApprovedBy() != null ? user.getApprovedBy().getName() : null)
                .approvedAt(user.getApprovedAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Get all pending applications
     */
    public List<UserApplicationDTO> getPendingApplications() {
        return userRepository.findByStatus(UserStatus.PENDING_VERIFICATION)
                .stream()
                .filter(u -> !u.getRole().equals(User.UserRole.ADMIN))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applications by status
     */
    public List<UserApplicationDTO> getApplicationsByStatus(UserStatus status) {
        return userRepository.findByStatus(status)
                .stream()
                .filter(u -> !u.getRole().equals(User.UserRole.ADMIN))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all CAHW applications
     */
    public List<UserApplicationDTO> getCahwApplications() {
        return userRepository.findByRole(User.UserRole.CAHW)
                .stream()
                .filter(u -> !u.getStatus().equals(UserStatus.ACTIVE))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all veterinarian applications
     */
    public List<UserApplicationDTO> getVeterinarianApplications() {
        return userRepository.findByRole(User.UserRole.VETERINARIAN)
                .stream()
                .filter(u -> !u.getStatus().equals(UserStatus.ACTIVE))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applications by sector
     */
    public List<UserApplicationDTO> getApplicationsBySector(String sector) {
        return userRepository.findAll()
                .stream()
                .filter(u -> sector.equalsIgnoreCase(u.getSector()) && 
                            !u.getRole().equals(User.UserRole.ADMIN))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Approve a user application - Admin only.
     * For CAHWs: Set to ACTIVE (veterinarians will approve via CAHWApplicationService)
     * For Veterinarians: Check if sector has active vet. If not, set to ACTIVE. Otherwise, reject.
     * Note: Only ADMIN can approve veterinarians. CAHWs can be approved by admin or sector veterinarian.
     */
    @Transactional
    public UserApplicationDTO approveApplication(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<User> currentUser = userStatusChecker.getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new RuntimeException("Cannot determine current user");
        }

        // Only ADMIN can approve veterinarians
        if (user.getRole() == User.UserRole.VETERINARIAN) {
            if (currentUser.get().getRole() != User.UserRole.ADMIN) {
                throw new RuntimeException("Only ADMIN can approve veterinarians");
            }

            // Check if sector already has an active veterinarian
            if (user.getSector() != null) {
                Optional<User> existingActiveVet = userRepository.findActiveSectorVeterinarian(
                    UserStatus.ACTIVE, 
                    user.getSector()
                );
                
                if (existingActiveVet.isPresent()) {
                    throw new RuntimeException("Sector " + user.getSector() + 
                        " already has an active veterinarian. Only one vet per sector allowed.");
                }
            }
            // Approve veterinarian directly to ACTIVE
            user.setStatus(UserStatus.ACTIVE);
        } else if (user.getRole() == User.UserRole.CAHW) {
            // CAHWs approved by admin go directly to ACTIVE
            // (Veterinarians in same sector can also approve via CAHWApplicationService)
            user.setStatus(UserStatus.ACTIVE);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        user.setApprovedBy(currentUser.get());
        user.setApprovedAt(LocalDateTime.now());
        user.setRejectionReason(null);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    /**
     * Reject a user application
     */
    @Transactional
    public UserApplicationDTO rejectApplication(Long userId, String rejectionReason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.PENDING_VERIFICATION); // Stays pending but with rejection reason
        user.setRejectionReason(rejectionReason);
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    /**
     * Suspend a user account
     */
    @Transactional
    public UserApplicationDTO suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.SUSPENDED);
        user.setActive(false);
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    /**
     * Activate a user (when ready - e.g., after training is complete)
     */
    @Transactional
    public UserApplicationDTO activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("Cannot activate a suspended user");
        }

        // Enforce one active veterinarian per sector rule
        if (user.getRole() == User.UserRole.VETERINARIAN) {
            if (user.getSector() != null) {
                Optional<User> existingActiveVet = userRepository.findActiveSectorVeterinarian(
                    UserStatus.ACTIVE, 
                    user.getSector()
                );
                
                if (existingActiveVet.isPresent() && !existingActiveVet.get().getId().equals(user.getId())) {
                    throw new RuntimeException("Sector " + user.getSector() + 
                        " already has an active veterinarian. Only one vet per sector allowed.");
                }
            }
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setActive(true);
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    /**
     * Assign a veterinarian to a CAHW
     */
    @Transactional
    public UserApplicationDTO assignVeterinarian(Long cahwId, Long vetId) {
        User cahw = userRepository.findById(cahwId)
                .orElseThrow(() -> new RuntimeException("CAHW user not found"));

        if (cahw.getRole() != User.UserRole.CAHW) {
            throw new RuntimeException("User is not a CAHW");
        }

        User vet = userRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Veterinarian user not found"));

        if (vet.getRole() != User.UserRole.VETERINARIAN) {
            throw new RuntimeException("User is not a veterinarian");
        }

        if (vet.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Veterinarian is not active");
        }

        // Ensure sector match
        if (cahw.getSector() != null && !cahw.getSector().equals(vet.getSector())) {
            throw new RuntimeException("Veterinarian sector does not match CAHW sector");
        }

        cahw.setAssignedVeterinarian(vet);
        User savedCahw = userRepository.save(cahw);
        return convertToDTO(savedCahw);
    }
}
