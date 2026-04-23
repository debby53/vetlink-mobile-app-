package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByRole(User.UserRole role);
    List<User> findByActive(Boolean active);
    
    // Find users by assigned Location
    List<User> findByLocationId(Long locationId);

    // Find users whose location's parent is the given id (e.g., users in a cell belonging to a village)
    List<User> findByLocationParentLocationId(Long parentLocationId);

    // Two-level parent lookup (e.g., users in cells under sectors)
    List<User> findByLocationParentLocationParentLocationId(Long grandParentLocationId);
    
    // New queries for verification workflow
    List<User> findByStatus(UserStatus status);
    
    List<User> findByRoleAndStatus(User.UserRole role, UserStatus status);
    
    @Query("SELECT u FROM User u WHERE u.role = 'CAHW' AND u.status = ?1 AND u.sector = ?2")
    List<User> findCahwsByStatusAndSector(UserStatus status, String sector);
    
    @Query("SELECT u FROM User u WHERE u.role = 'VETERINARIAN' AND u.status = ?1 AND u.sector = ?2")
    Optional<User> findActiveSectorVeterinarian(UserStatus status, String sector);

    List<User> findByAssignedVeterinarianId(Long assignedVeterinarianId);

    List<User> findByApprovedById(Long approvedById);
}
