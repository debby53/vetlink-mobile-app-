package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.UserStatusDTO;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.security.UserStatusChecker;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserProfileService {
    
    private final UserRepository userRepository;
    private final UserStatusChecker userStatusChecker;

    /**
     * Get current user's status
     */
    public UserStatusDTO getCurrentUserStatus() {
        Optional<User> user = userStatusChecker.getCurrentUser();
        if (user.isEmpty()) {
            throw new RuntimeException("User not authenticated");
        }
        return convertToDTO(user.get());
    }

    /**
     * Get user status by ID
     */
    public UserStatusDTO getUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    /**
     * Check if current user is active
     */
    public boolean isCurrentUserActive() {
        Optional<User> user = userStatusChecker.getCurrentUser();
        return user.isPresent() && user.get().getStatus() == UserStatus.ACTIVE;
    }

    /**
     * Check if current user has assigned veterinarian
     */
    public Optional<UserStatusDTO> getCurrentUserAssignedVeterinarian() {
        Optional<User> user = userStatusChecker.getCurrentUser();
        if (user.isEmpty() || user.get().getAssignedVeterinarian() == null) {
            return Optional.empty();
        }
        return Optional.of(convertToDTO(user.get().getAssignedVeterinarian()));
    }

    /**
     * Convert User to UserStatusDTO
     */
    private UserStatusDTO convertToDTO(User user) {
        return UserStatusDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .status(user.getStatus())
                .statusDescription(user.getStatus().getDescription())
                .sector(user.getSector())
                .district(user.getDistrict())
                .assignedVeterinarianName(user.getAssignedVeterinarian() != null ? 
                    user.getAssignedVeterinarian().getName() : null)
                .rejectionReason(user.getRejectionReason())
                .build();
    }
}
