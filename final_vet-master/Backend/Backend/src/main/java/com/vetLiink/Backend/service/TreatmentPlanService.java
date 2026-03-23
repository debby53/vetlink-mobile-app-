package com.vetLiink.Backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.dto.TreatmentPlanDTO;
import com.vetLiink.Backend.entity.Case;
import com.vetLiink.Backend.entity.TreatmentPlan;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.CaseRepository;
import com.vetLiink.Backend.repository.TreatmentPlanRepository;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TreatmentPlanService {
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    public TreatmentPlanDTO createTreatmentPlan(TreatmentPlanDTO treatmentPlanDTO) {
        Case caze = null;
        if (treatmentPlanDTO.getCaseId() != null) {
            caze = caseRepository.findById(treatmentPlanDTO.getCaseId())
                    .orElseThrow(() -> new RuntimeException("Case not found"));
        }
        
        User vet = userRepository.findById(treatmentPlanDTO.getVeterinarianId())
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        // Parse the provided start date or use today
        LocalDateTime startDate = LocalDateTime.now();
        if (treatmentPlanDTO.getStartDate() != null && !treatmentPlanDTO.getStartDate().isEmpty()) {
            try {
                System.out.println("Processing start date: " + treatmentPlanDTO.getStartDate());
                LocalDate date = LocalDate.parse(treatmentPlanDTO.getStartDate());
                startDate = date.atStartOfDay();
            } catch (Exception e) {
                System.err.println("Failed to parse start date '" + treatmentPlanDTO.getStartDate() + "': " + e.getMessage());
                e.printStackTrace();
                // If parsing fails, use today's date
                startDate = LocalDateTime.now();
            }
        } else {
             System.out.println("Start date is null or empty, using current time");
        }

        TreatmentPlan plan = TreatmentPlan.builder()
                .caze(caze)
                .veterinarian(vet)
                .treatment(treatmentPlanDTO.getTreatment())
                .notes(treatmentPlanDTO.getNotes())
                .duration(treatmentPlanDTO.getDuration())
                .compliance(treatmentPlanDTO.getCompliance())
                .status(TreatmentPlan.TreatmentStatus.ACTIVE)
                .activityType(treatmentPlanDTO.getActivityType())
                .startDate(startDate)
                .build();

        TreatmentPlan savedPlan = treatmentPlanRepository.save(plan);
        return convertToDTO(savedPlan);
    }

    public TreatmentPlanDTO getTreatmentPlanById(Long id) {
        TreatmentPlan plan = treatmentPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment plan not found"));
        return convertToDTO(plan);
    }

    @Transactional(readOnly = true)
    public List<TreatmentPlanDTO> getTreatmentPlansByVeterinarianId(Long veterinarianId) {
        return treatmentPlanRepository.findByVeterinarianId(veterinarianId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TreatmentPlanDTO> getActiveTreatmentPlans(Long veterinarianId) {
        List<TreatmentPlan> plans = treatmentPlanRepository.findByVeterinarianId(veterinarianId);
        return plans.stream()
                .filter(p -> p.getStatus() == TreatmentPlan.TreatmentStatus.ACTIVE)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TreatmentPlanDTO updateTreatmentPlan(Long planId, TreatmentPlanDTO treatmentPlanDTO) {
        TreatmentPlan plan = treatmentPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Treatment plan not found"));

        plan.setTreatment(treatmentPlanDTO.getTreatment());
        plan.setNotes(treatmentPlanDTO.getNotes());
        plan.setDuration(treatmentPlanDTO.getDuration());
        plan.setCompliance(treatmentPlanDTO.getCompliance());
        
        if (treatmentPlanDTO.getStatus() != null) {
            plan.setStatus(TreatmentPlan.TreatmentStatus.valueOf(treatmentPlanDTO.getStatus()));
        }

        TreatmentPlan updatedPlan = treatmentPlanRepository.save(plan);
        return convertToDTO(updatedPlan);
    }

    public void deleteTreatmentPlan(Long planId) {
        treatmentPlanRepository.deleteById(planId);
    }

    private TreatmentPlanDTO convertToDTO(TreatmentPlan plan) {
        return TreatmentPlanDTO.builder()
                .id(plan.getId())
                .caseId(plan.getCaze() != null ? plan.getCaze().getId() : null)
                .veterinarianId(plan.getVeterinarian().getId())
                .treatment(plan.getTreatment())
                .notes(plan.getNotes())
                .duration(plan.getDuration())
                .compliance(plan.getCompliance())
                .status(plan.getStatus().toString())
                .activityType(plan.getActivityType())
                .startDate(plan.getStartDate() != null ? plan.getStartDate().toLocalDate().toString() : null)
                .createdAt(plan.getCreatedAt() != null ? plan.getCreatedAt().toString() : null)
                .build();
    }
}
