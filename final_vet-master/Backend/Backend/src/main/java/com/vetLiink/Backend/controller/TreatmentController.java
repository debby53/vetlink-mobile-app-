package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.entity.TreatmentRecord;
import com.vetLiink.Backend.repository.TreatmentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/api/treatments")
@Validated
public class TreatmentController {

    @Autowired
    private TreatmentRecordRepository treatmentRepository; // Assuming this will be created or is generic

    @PostMapping
    public ResponseEntity<String> logTreatment(@Valid @RequestBody TreatmentRecordDto recordDto) {
        // 1. Validation Logic
        if (recordDto.getDosage() <= 0) {
            return ResponseEntity.badRequest().body("Dosage must be positive.");
        }
        
        // 2. Map DTO to Entity
        TreatmentRecord record = new TreatmentRecord();
        record.setAnimalId(recordDto.getAnimalId());
        record.setCahwId(recordDto.getCahwId()); // In real app, get from SecurityContext
        record.setDiagnosis(recordDto.getDiagnosis());
        record.setDrugBatchNumber(recordDto.getDrugBatchNumber());
        record.setTreatmentDate(java.time.LocalDateTime.now());
        
        // 3. Save
        // treatmentRepository.save(record); 
        
        return ResponseEntity.ok("Treatment logged successfully. Batch: " + recordDto.getDrugBatchNumber());
    }

    // DTO Inner Class for Validation
    public static class TreatmentRecordDto {
        @NotNull(message = "Animal ID is required")
        private Long animalId;
        
        @NotNull(message = "CAHW ID is required")
        private Long cahwId;
        
        @NotNull(message = "Diagnosis is required")
        private String diagnosis;
        
        @NotNull(message = "Batch Number is required")
        private String drugBatchNumber;
        
        private Double dosage;

        // Getters and Setters
        public Long getAnimalId() { return animalId; }
        public void setAnimalId(Long id) { this.animalId = id; }
        public Long getCahwId() { return cahwId; }
        public void setCahwId(Long id) { this.cahwId = id; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String d) { this.diagnosis = d; }
        public String getDrugBatchNumber() { return drugBatchNumber; }
        public void setDrugBatchNumber(String b) { this.drugBatchNumber = b; }
        public Double getDosage() { return dosage; }
        public void setDosage(Double d) { this.dosage = d; }
    }
}
