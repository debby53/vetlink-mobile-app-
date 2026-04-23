package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.UserDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vetLiink.Backend.dto.SignupRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            UserDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/assign-location/{locationId}")
    public ResponseEntity<?> assignUserLocation(@PathVariable Long id, @PathVariable Long locationId) {
        try {
            UserDTO updatedUser = userService.assignUserLocation(id, locationId);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserDTO>> getAllActiveUsers() {
        List<UserDTO> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<String> lockUser(@PathVariable Long id) {
        try {
            userService.lockUser(id);
            return ResponseEntity.ok("User locked successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<String> unlockUser(@PathVariable Long id) {
        try {
            userService.unlockUser(id);
            return ResponseEntity.ok("User unlocked successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody SignupRequest request) {
        try {
            UserDTO newUser = userService.createUser(request);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO request) {
        try {
            UserDTO updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    // New endpoint for users to update their own profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateOwnProfile(@PathVariable Long id, @RequestBody UserDTO request) {
        try {
            // Users can only update their own profile (name, email, phone, location)
            // Admin-only fields like role, status, etc. are ignored
            UserDTO updatedUser = userService.updateUserProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            String message = e.getMessage() != null ? e.getMessage() : "Failed to delete user";
            int status = "User not found".equalsIgnoreCase(message) ? 404 : 400;
            return ResponseEntity.status(status)
                    .body(ErrorResponse.builder().message(message).status(status).build());
        }
    }
}
