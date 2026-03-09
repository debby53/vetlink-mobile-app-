package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.TreatmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Long> {
    List<TreatmentPlan> findByCazeId(Long caseId);
    List<TreatmentPlan> findByVeterinarianId(Long veterinarianId);
    List<TreatmentPlan> findByStatus(TreatmentPlan.TreatmentStatus status);
    void deleteByCazeId(Long caseId);
    void deleteByVeterinarianId(Long veterinarianId);
}
