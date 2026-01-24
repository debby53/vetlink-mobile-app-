package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    Optional<Veterinarian> findByUserId(Long userId);
    Optional<Veterinarian> findByLicenseNumber(String licenseNumber);
    
    @Query("SELECT v FROM Veterinarian v WHERE v.user.active = true")
    List<Veterinarian> findAllActive();
    
    @Query("SELECT v FROM Veterinarian v WHERE v.user.location.id = :locationId")
    List<Veterinarian> findByLocationId(Long locationId);
    
    @Query("SELECT v FROM Veterinarian v WHERE v.user.status = 'ACTIVE' AND v.sector = :sector")
    Optional<Veterinarian> findActiveBySector(String sector);
    
    @Query("SELECT v FROM Veterinarian v WHERE v.user.status = 'ACTIVE' AND v.sector = :sector")
    List<Veterinarian> findAllActiveBySector(String sector);
    
    @Query("SELECT v FROM Veterinarian v WHERE v.user.status = :status")
    List<Veterinarian> findByStatus(UserStatus status);
}
