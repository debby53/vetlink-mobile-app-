package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.HealthRecordDTO;
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
    public ResponseEntity<HealthRecordDTO> createHealthRecord(@RequestBody HealthRecordDTO healthRecordDTO) {
        try {
            HealthRecordDTO newRecord = healthRecordService.createHealthRecord(healthRecordDTO);
            return ResponseEntity.status(201).body(newRecord);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecordDTO> getHealthRecordById(@PathVariable Long id) {
        try {
            HealthRecordDTO record = healthRecordService.getRecordById(id);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<HealthRecordDTO>> getRecordsByAnimalId(@PathVariable Long animalId) {
        try {
            List<HealthRecordDTO> records = healthRecordService.getRecordsByAnimalId(animalId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HealthRecordDTO> updateHealthRecord(@PathVariable Long id, @RequestBody HealthRecordDTO healthRecordDTO) {
        try {
            HealthRecordDTO updatedRecord = healthRecordService.updateHealthRecord(id, healthRecordDTO);
            return ResponseEntity.ok(updatedRecord);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
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
