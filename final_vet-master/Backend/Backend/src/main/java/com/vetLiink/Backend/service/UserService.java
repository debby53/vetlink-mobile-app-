package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.UserDTO;
import com.vetLiink.Backend.dto.SignupRequest;
import com.vetLiink.Backend.entity.Animal;
import com.vetLiink.Backend.entity.Case;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.repository.*;
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
    private final VeterinarianRepository veterinarianRepository;
    private final AnimalRepository animalRepository;
    private final CaseRepository caseRepository;
    private final VisitRepository visitRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final TreatmentRecordRepository treatmentRecordRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final UserTrainingRepository userTrainingRepository;
    private final CertificationRepository certificationRepository;
    private final CallRepository callRepository;
    private final MarketListingRepository marketListingRepository;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
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

        clearUserReferences(id);
        deleteRoleSpecificData(user);

        notificationRepository.deleteByUserId(id);
        certificationRepository.deleteByUserId(id);
        userTrainingRepository.deleteByUserId(id);
        messageRepository.deleteBySenderIdOrRecipientId(id, id);
        callRepository.deleteByCallerIdOrRecipientId(id, id);
        marketListingRepository.deleteBySellerId(id);

        veterinarianRepository.findByUserId(id).ifPresent(veterinarianRepository::delete);
        userRepository.delete(user);
    }

    private void clearUserReferences(Long userId) {
        List<User> assignedUsers = userRepository.findByAssignedVeterinarianId(userId);
        assignedUsers.forEach(user -> user.setAssignedVeterinarian(null));
        userRepository.saveAll(assignedUsers);

        List<User> approvedUsers = userRepository.findByApprovedById(userId);
        approvedUsers.forEach(user -> user.setApprovedBy(null));
        userRepository.saveAll(approvedUsers);

        List<Case> cahwCases = caseRepository.findByCahwId(userId);
        cahwCases.forEach(caze -> caze.setCahw(null));
        caseRepository.saveAll(cahwCases);

        List<Case> veterinarianCases = caseRepository.findByVeterinarianId(userId);
        veterinarianCases.forEach(caze -> caze.setVeterinarian(null));
        caseRepository.saveAll(veterinarianCases);
    }

    private void deleteRoleSpecificData(User user) {
        Long userId = user.getId();

        switch (user.getRole()) {
            case FARMER -> deleteFarmerData(userId);
            case VETERINARIAN -> deleteVeterinarianData(userId);
            case CAHW -> deleteCahwData(userId);
            case ADMIN -> {
                // No admin-owned domain records beyond shared references cleared above.
            }
        }
    }

    private void deleteFarmerData(Long farmerId) {
        visitRepository.deleteByFarmerId(farmerId);

        List<Case> farmerCases = caseRepository.findByFarmerId(farmerId);
        for (Case caze : farmerCases) {
            treatmentPlanRepository.deleteByCazeId(caze.getId());
        }
        caseRepository.deleteAll(farmerCases);

        List<Animal> animals = animalRepository.findByFarmerId(farmerId);
        for (Animal animal : animals) {
            healthRecordRepository.deleteByAnimalId(animal.getId());
            treatmentRecordRepository.deleteByAnimalId(animal.getId());
        }
        animalRepository.deleteAll(animals);
    }

    private void deleteVeterinarianData(Long veterinarianId) {
        treatmentPlanRepository.deleteByVeterinarianId(veterinarianId);
        visitRepository.deleteByVeterinarianId(veterinarianId);
        veterinarianRepository.findByUserId(veterinarianId).ifPresent(veterinarianRepository::delete);
    }

    private void deleteCahwData(Long cahwId) {
        treatmentRecordRepository.deleteByCahwId(cahwId);
    }

    private String resolveLocationName(User user) {
        try {
            if (user.getLocation() != null) {
                return user.getLocation().getDisplayName();
            }
        } catch (Exception e) {
            System.err.println("Could not load user location name: " + e.getMessage());
        }
        return null;
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
                .locationName(resolveLocationName(user))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
