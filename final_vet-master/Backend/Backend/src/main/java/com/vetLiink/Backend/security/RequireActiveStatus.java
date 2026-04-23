package com.vetLiink.Backend.security;

import com.vetLiink.Backend.entity.UserStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

/**
 * Annotation to enforce that a user must be in ACTIVE status to access a method.
 * Use this on controller methods or service methods to block non-active users.
 * 
 * Example:
 * @RequireActiveStatus
 * @PostMapping("/cases/accept")
 * public ResponseEntity<?> acceptCase(...)
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PreAuthorize("@userStatusChecker.isUserActive()")
public @interface RequireActiveStatus {
}
