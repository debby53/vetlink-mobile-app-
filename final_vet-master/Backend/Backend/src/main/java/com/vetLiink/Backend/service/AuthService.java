package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.LoginRequest;
import com.vetLiink.Backend.dto.SignupRequest;
import com.vetLiink.Backend.dto.AuthResponse;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.repository.LocationRepository;
import com.vetLiink.Backend.repository.VeterinarianRepository;
import com.vetLiink.Backend.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail(); // Can be email or phone
        Optional<User> user = userRepository.findByEmail(identifier);
        
        if (user.isEmpty()) {
            user = userRepository.findByPhoneNumber(identifier);
        }
        
        if (user.isEmpty()) {
            System.out.println("DEBUG: Login failed - User not found for identifier: " + identifier);
            throw new RuntimeException("Invalid credentials");
        }
        
        if (user.get().getPassword() == null) {
            System.out.println("DEBUG: Login failed - Password null for user: " + user.get().getEmail());
            throw new RuntimeException("Invalid credentials");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            System.out.println("DEBUG: Login failed - Password mismatch for user: " + user.get().getEmail());
            throw new RuntimeException("Invalid credentials");
        }

        User foundUser = user.get();
        // Use identifier (email or phone) for token generation
        String tokenSubject = foundUser.getEmail() != null ? foundUser.getEmail() : foundUser.getPhoneNumber();
        String token = jwtTokenProvider.generateToken(tokenSubject, foundUser.getRole().toString());

        System.out.println("DEBUG: Login password for user: " + foundUser.getName() + ", Identifier: " + identifier);
        
        return AuthResponse.builder()
                .id(foundUser.getId())
                .name(foundUser.getName() != null ? foundUser.getName() : "Unknown User")
                .email(foundUser.getEmail())
                .role(foundUser.getRole().toString().toLowerCase())
                .status(foundUser.getStatus().toString())
                .locationId(foundUser.getLocation() != null ? foundUser.getLocation().getId() : null)
                .token(token)
                .requiresApproval(foundUser.getStatus() != UserStatus.ACTIVE)
                .build();
    }

    public void initiateOtpLogin(String phoneNumber) {
        if (userRepository.findByPhoneNumber(phoneNumber).isEmpty()) {
            throw new RuntimeException("Account not found with this phone number");
        }
        otpService.generateOtp(phoneNumber);
    }

    public AuthResponse verifyOtpLogin(String phoneNumber, String otp) {
        if (!otpService.validateOtp(phoneNumber, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        Optional<User> user = userRepository.findByPhoneNumber(phoneNumber);
        User finalUser;

        if (user.isPresent()) {
            finalUser = user.get();
            // Allow all roles to login via OTP if they have a phone number
        } else {
            throw new RuntimeException("Account not found. Please sign up first.");
        }

        String finalName = finalUser.getName();
        // Fix for demo: If user is the specific 'Farmer' test account, show 'Kalisa'
        if ((finalName == null || finalName.equalsIgnoreCase("Farmer")) && 
            "0781218195".equals(finalUser.getPhoneNumber())) {
            finalName = "Kalisa";
        }

        String token = jwtTokenProvider.generateToken(finalUser.getPhoneNumber(), finalUser.getRole().toString());

        return AuthResponse.builder()
                .id(finalUser.getId())
                .name(finalName != null ? finalName : "Unknown User")
                .email(finalUser.getEmail())
                .role(finalUser.getRole().toString().toLowerCase())
                .status(finalUser.getStatus().toString())
                .locationId(finalUser.getLocation() != null ? finalUser.getLocation().getId() : null)
                .token(token)
                .requiresApproval(finalUser.getStatus() != UserStatus.ACTIVE)
                .build();
    }

    public AuthResponse signup(SignupRequest request) {
        if (request.getEmail() != null && !request.getEmail().isEmpty() && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() && userRepository.findByPhoneNumber(request.getPhone()).isPresent()) {
             throw new RuntimeException("Phone number already exists");
        }

        // Validate sector is provided for CAHWs and VETs
        String role = request.getRole().toUpperCase();
        if ((role.equals("CAHW") || role.equals("VETERINARIAN")) && 
            (request.getSector() == null || request.getSector().isEmpty())) {
            throw new RuntimeException("Sector is required for " + role);
        }

        User.UserRole userRole = User.UserRole.valueOf(role);
        UserStatus initialStatus;
        boolean isActive;

        if (userRole == User.UserRole.FARMER) {
            initialStatus = UserStatus.ACTIVE;
            isActive = true;
        } else {
            initialStatus = UserStatus.PENDING_VERIFICATION;
            isActive = false;
        }

        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone()) // Save phone to User entity
                .password(request.getPassword() != null ? passwordEncoder.encode(request.getPassword()) : null)
                .role(userRole)
                .active(isActive)
                .status(initialStatus)
                .sector(request.getSector())
                .district(request.getDistrict())
                .build();

        // Assign location if provided
        if (request.getLocationId() != null) {
            Optional<Location> location = locationRepository.findById(request.getLocationId());
            if (location.isPresent()) {
                newUser.setLocation(location.get());
            }
        }

        User savedUser = userRepository.save(newUser);

        // If registering as veterinarian, create veterinarian profile
        if (role.equals("VETERINARIAN")) {
            Veterinarian vet = Veterinarian.builder()
                    .user(savedUser)
                    .phone(request.getPhone() != null ? request.getPhone() : "")
                    .specialization(request.getSpecialization() != null ? request.getSpecialization() : "")
                    .licenseNumber(request.getLicenseNumber() != null ? request.getLicenseNumber() : "")
                    .sector(request.getSector())
                    .licenseVerificationDocument(request.getLicenseVerificationDocumentUrl())
                    .build();
            veterinarianRepository.save(vet);
        }

        boolean requiresApproval = savedUser.getStatus() != UserStatus.ACTIVE;
        String message = requiresApproval
                ? "Your account request has been received. Please wait for approval by the administrator. You will receive an email once your account is approved."
                : "Account created successfully.";
        String token = requiresApproval
                ? null
                : jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().toString());

        return AuthResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().toString().toLowerCase())
                .status(savedUser.getStatus().toString())
                .locationId(savedUser.getLocation() != null ? savedUser.getLocation().getId() : null)
                .token(token)
                .message(message)
                .requiresApproval(requiresApproval)
                .build();
    }}
