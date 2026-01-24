package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByVeterinarianId(Long veterinarianId);
    
    List<Visit> findByFarmerId(Long farmerId);
    
    List<Visit> findByVeterinarianIdOrderByScheduledDateDesc(Long veterinarianId);
    
    List<Visit> findByFarmerIdOrderByScheduledDateDesc(Long farmerId);
    
    List<Visit> findByStatusAndScheduledDateBetween(Visit.VisitStatus status, LocalDateTime startDate, LocalDateTime endDate);
    
    List<Visit> findByVeterinarianIdAndStatus(Long veterinarianId, Visit.VisitStatus status);
    
    List<Visit> findByFarmerIdAndStatus(Long farmerId, Visit.VisitStatus status);
    
    List<Visit> findByCaze(com.vetLiink.Backend.entity.Case caze);
}
