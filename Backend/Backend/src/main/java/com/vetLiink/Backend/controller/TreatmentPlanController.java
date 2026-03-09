package com.vetLiink.Backend.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.dto.TreatmentPlanDTO;
import com.vetLiink.Backend.service.TreatmentPlanService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/treatment-plans")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class TreatmentPlanController {
    private static final Logger logger = LoggerFactory.getLogger(TreatmentPlanController.class);
    private final TreatmentPlanService treatmentPlanService;

    @PostMapping
    public ResponseEntity<?> createTreatmentPlan(@RequestBody TreatmentPlanDTO treatmentPlanDTO) {
        try {
            logger.info("Creating treatment plan with data: {}", treatmentPlanDTO);
            TreatmentPlanDTO newPlan = treatmentPlanService.createTreatmentPlan(treatmentPlanDTO);
            return ResponseEntity.status(201).body(newPlan);
        } catch (Exception e) {
            logger.error("Error creating treatment plan: ", e);
            ErrorResponse error = ErrorResponse.builder()
                .message(e.getMessage())
                .status(400)
                .build();
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTreatmentPlanById(@PathVariable Long id) {
        try {
            TreatmentPlanDTO plan = treatmentPlanService.getTreatmentPlanById(id);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/veterinarian/{veterinarianId}")
    public ResponseEntity<List<TreatmentPlanDTO>> getTreatmentPlansByVeterinarianId(@PathVariable Long veterinarianId) {
        List<TreatmentPlanDTO> plans = treatmentPlanService.getTreatmentPlansByVeterinarianId(veterinarianId);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/veterinarian/{veterinarianId}/active")
    public ResponseEntity<List<TreatmentPlanDTO>> getActiveTreatmentPlans(@PathVariable Long veterinarianId) {
        List<TreatmentPlanDTO> plans = treatmentPlanService.getActiveTreatmentPlans(veterinarianId);
        return ResponseEntity.ok(plans);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTreatmentPlan(@PathVariable Long id, @RequestBody TreatmentPlanDTO treatmentPlanDTO) {
        try {
            TreatmentPlanDTO updatedPlan = treatmentPlanService.updateTreatmentPlan(id, treatmentPlanDTO);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTreatmentPlan(@PathVariable Long id) {
        try {
            treatmentPlanService.deleteTreatmentPlan(id);
            return ResponseEntity.ok("Treatment plan deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Treatment plan not found");
        }
    }
}
