package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.HealthRecordDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.HealthRecordService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class HealthRecordController {
    private final HealthRecordService healthRecordService;

    @PostMapping
    public ResponseEntity<?> createHealthRecord(@RequestBody HealthRecordDTO healthRecordDTO) {
        try {
            HealthRecordDTO newRecord = healthRecordService.createHealthRecord(healthRecordDTO);
            return ResponseEntity.status(201).body(newRecord);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHealthRecordById(@PathVariable Long id) {
        try {
            HealthRecordDTO record = healthRecordService.getRecordById(id);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<?> getRecordsByAnimalId(@PathVariable Long animalId) {
        try {
            List<HealthRecordDTO> records = healthRecordService.getRecordsByAnimalId(animalId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHealthRecord(@PathVariable Long id, @RequestBody HealthRecordDTO healthRecordDTO) {
        try {
            HealthRecordDTO updatedRecord = healthRecordService.updateHealthRecord(id, healthRecordDTO);
            return ResponseEntity.ok(updatedRecord);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHealthRecord(@PathVariable Long id) {
        try {
            healthRecordService.deleteHealthRecord(id);
            return ResponseEntity.ok("Health record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Record not found");
        }
    }
}
