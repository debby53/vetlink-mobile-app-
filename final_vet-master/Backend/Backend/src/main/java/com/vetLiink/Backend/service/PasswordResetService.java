package com.vetLiink.Backend.service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vetLiink.Backend.dto.ForgotPasswordResponse;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PasswordResetService {

    private static final long TOKEN_EXPIRY_MS = 15 * 60 * 1000;
    private static final String TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Map<String, ResetTokenEntry> tokenStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public ForgotPasswordResponse createResetToken(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        String token = generateToken(8);
        tokenStore.put(normalizedEmail, new ResetTokenEntry(token, System.currentTimeMillis() + TOKEN_EXPIRY_MS));

        System.out.println("==============================================");
        System.out.println("SIMULATED PASSWORD RESET EMAIL");
        System.out.println("To: " + user.getEmail());
        System.out.println("Reset token: " + token);
        System.out.println("==============================================");

        return ForgotPasswordResponse.builder()
                .message("Password reset token generated successfully")
                .resetToken(token)
                .build();
    }

    public void resetPassword(String email, String token, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        ResetTokenEntry entry = tokenStore.get(normalizedEmail);
        if (entry == null) {
            throw new RuntimeException("No reset token found for this email");
        }

        if (System.currentTimeMillis() > entry.expiresAt()) {
            tokenStore.remove(normalizedEmail);
            throw new RuntimeException("Reset token has expired");
        }

        if (!entry.token().equalsIgnoreCase(token == null ? "" : token.trim())) {
            throw new RuntimeException("Invalid reset token");
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
        tokenStore.remove(normalizedEmail);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String generateToken(int length) {
        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            token.append(TOKEN_CHARS.charAt(secureRandom.nextInt(TOKEN_CHARS.length())));
        }
        return token.toString();
    }

    private record ResetTokenEntry(String token, long expiresAt) {
    }
}
