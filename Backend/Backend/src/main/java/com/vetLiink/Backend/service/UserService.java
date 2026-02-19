package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.UserDTO;
import com.vetLiink.Backend.dto.SignupRequest;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.repository.LocationRepository;
import com.vetLiink.Backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.vetLiink.Backend.repository.VeterinarianRepository veterinarianRepository;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(String role) {
        User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
        return userRepository.findByRole(userRole).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllActiveUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO assignUserLocation(Long userId, Long locationId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Location location = locationRepository.findById(locationId).orElseThrow(() -> new RuntimeException("Location not found"));

        user.setLocation(location);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public void lockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }


    public void unlockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public UserDTO createUser(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setActive(true);
        user.setStatus(UserStatus.ACTIVE); // Admin created users are active by default
        user.setSector(request.getSector());
        user.setDistrict(request.getDistrict());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            user.setLocation(location);
        }

        user = userRepository.save(user);

        // If veterinarian, create profile
        if (user.getRole() == User.UserRole.VETERINARIAN) {
            Veterinarian vet = Veterinarian.builder()
                    .user(user)
                    .phone(request.getPhone() != null ? request.getPhone() : "")
                    .specialization(request.getSpecialization() != null ? request.getSpecialization() : "")
                    .licenseNumber(request.getLicenseNumber() != null ? request.getLicenseNumber() : "")
                    .sector(request.getSector())
                    .build();
            veterinarianRepository.save(vet);
        }

        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already taken");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            user.setLocation(location);
        }
        // Note: Password update is not handled here, should be separate if needed

        user = userRepository.save(user);
        return convertToDTO(user);
    }

    // New method for users to update their own profile (non-admin fields only)
    @Transactional
    public UserDTO updateUserProfile(Long id, UserDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only allow updating safe fields (not role, status, etc.)
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already taken");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            user.setLocation(location);
        }

        user = userRepository.save(user);
        return convertToDTO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If user is a veterinarian, we need to handle the license number uniqueness constraint
        if (user.getRole() == User.UserRole.VETERINARIAN) {
            java.util.Optional<Veterinarian> vetOpt = veterinarianRepository.findByUserId(user.getId());
            if (vetOpt.isPresent()) {
                Veterinarian vet = vetOpt.get();
                // Obfuscate license number to allow reuse
                vet.setLicenseNumber(vet.getLicenseNumber() + "_DELETED_" + System.currentTimeMillis());
                veterinarianRepository.save(vet);
            }
        }
        
        // Soft delete: deactivate and obfuscate email to allow reuse
        user.setActive(false);
        user.setStatus(UserStatus.SUSPENDED);
        user.setEmail(user.getEmail() + "_DELETED_" + System.currentTimeMillis());
        userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .phoneNumber(user.getPhoneNumber())
                .active(user.getActive())
                .status(user.getStatus().toString())
                .locationId(user.getLocation() != null ? user.getLocation().getId() : null)
                .locationName(user.getLocation() != null ? user.getLocation().getDisplayName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
