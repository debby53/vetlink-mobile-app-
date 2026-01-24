package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.LoginRequest;
import com.vetLiink.Backend.dto.SignupRequest;
import com.vetLiink.Backend.dto.AuthResponse;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR: Login exception caught in controller:");
            e.printStackTrace();
            return ResponseEntity.status(401)
                    .body(ErrorResponse.builder()
                            .message(e.getMessage() != null ? e.getMessage() : "Login failed")
                            .status(401)
                            .build());
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(ErrorResponse.builder()
                            .message(e.getMessage() != null ? e.getMessage() : "Signup failed")
                            .status(400)
                            .build());
        }
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody LoginRequest request) {
        try {
            authService.initiateOtpLogin(request.getPhoneNumber());
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(ErrorResponse.builder()
                            .message(e.getMessage() != null ? e.getMessage() : "Failed to send OTP")
                            .status(400)
                            .build());
        }
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.verifyOtpLogin(request.getPhoneNumber(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(ErrorResponse.builder()
                            .message(e.getMessage() != null ? e.getMessage() : "OTP verification failed")
                            .status(401)
                            .build());
        }
    }
}
