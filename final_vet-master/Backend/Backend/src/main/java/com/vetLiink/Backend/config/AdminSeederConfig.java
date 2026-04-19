package com.vetLiink.Backend.config;

import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import com.vetLiink.Backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration(proxyBeanMethods = false)
public class AdminSeederConfig {

    @Bean
    @ConditionalOnProperty(name = "app.seed.admin.enabled", havingValue = "true")
    public CommandLineRunner seedAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@vetlink.com";
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                System.out.println("Admin user already exists. Seeder skipped.");
                return;
            }
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                System.out.println("🌱 Seeding Admin User...");
                User admin = User.builder()
                        .name("System Admin")
                        .email(adminEmail)
                        .phoneNumber("0780000000")
                        .password(passwordEncoder.encode("password"))
                        .role(User.UserRole.ADMIN)
                        .active(true)
                        .status(UserStatus.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                userRepository.save(admin);
                System.out.println("✅ Admin User created: " + adminEmail + " / password");
            } else {
                System.out.println("ℹ️ Admin User already exists. Resetting password...");
                User admin = userRepository.findByEmail(adminEmail).get();
                // Ensure password is reset to 'password'
                admin.setPassword(passwordEncoder.encode("password"));
                // Ensure role is ADMIN
                admin.setRole(User.UserRole.ADMIN);
                // Ensure active
                admin.setActive(true);
                admin.setStatus(UserStatus.ACTIVE);
                
                userRepository.save(admin);
                System.out.println("✅ Admin password reset to 'password'");
            }
        };
    }
}
