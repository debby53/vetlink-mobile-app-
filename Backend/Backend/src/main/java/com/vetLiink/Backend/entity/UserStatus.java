package com.vetLiink.Backend.entity;

/**
 * UserStatus enum defines the verification and activation status of users in VetLink.
 * 
 * Workflow:
 * - PENDING_VERIFICATION: Initial status after signup, awaiting admin/vet approval
 * - TRAINING_REQUIRED: User approved but must complete mandatory training
 * - ACTIVE: User fully verified and can access all features
 * - SUSPENDED: User account suspended (by admin or due to violations)
 */
public enum UserStatus {
    PENDING_VERIFICATION("Pending Verification - Awaiting approval"),
    TRAINING_REQUIRED("Training Required - Complete onboarding training"),
    ACTIVE("Active - Full access granted"),
    SUSPENDED("Suspended - Access revoked");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
