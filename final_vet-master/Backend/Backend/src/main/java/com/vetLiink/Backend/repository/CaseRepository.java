package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {
    List<Case> findByFarmerId(Long farmerId);
    List<Case> findByVeterinarianId(Long veterinarianId);
    List<Case> findByCahwId(Long cahwId);
    List<Case> findByStatus(Case.CaseStatus status);
    List<Case> findByAnimalId(Long animalId);
    List<Case> findByLocationId(Long locationId);
}
