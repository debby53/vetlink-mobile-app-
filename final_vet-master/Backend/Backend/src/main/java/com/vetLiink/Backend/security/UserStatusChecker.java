package com.vetLiink.Backend.security;

import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Component to check user status and enforce access control rules.
 * Used by @RequireActiveStatus annotation and throughout the application.
 */
@Component("userStatusChecker")
public class UserStatusChecker {

    @Autowired
    private UserRepository userRepository;

    /**
     * Check if the current authenticated user is ACTIVE.
     * Returns false if user not authenticated or not ACTIVE.
     */
    public boolean isUserActive() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String userId = authentication.getPrincipal().toString();
            Optional<User> user = userRepository.findById(Long.parseLong(userId));
            return user.isPresent() && user.get().getStatus() == UserStatus.ACTIVE;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if the current user can perform admin operations.
     * Only ADMIN users can perform admin operations.
     */
    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String userId = authentication.getPrincipal().toString();
            Optional<User> user = userRepository.findById(Long.parseLong(userId));
            return user.isPresent() && user.get().getRole() == User.UserRole.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if the current user is a veterinarian (any status).
     */
    public boolean isVeterinarian() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String userId = authentication.getPrincipal().toString();
            Optional<User> user = userRepository.findById(Long.parseLong(userId));
            return user.isPresent() && user.get().getRole() == User.UserRole.VETERINARIAN;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if the current user is a CAHW (any status).
     */
    public boolean isCahw() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String userId = authentication.getPrincipal().toString();
            Optional<User> user = userRepository.findById(Long.parseLong(userId));
            return user.isPresent() && user.get().getRole() == User.UserRole.CAHW;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the current authenticated user.
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        try {
            String userId = authentication.getPrincipal().toString();
            return userRepository.findById(Long.parseLong(userId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }


    /**
     * Get the current authenticated user's ID.
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        try {
            return Long.parseLong(authentication.getPrincipal().toString());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format");
        }
    }
}
