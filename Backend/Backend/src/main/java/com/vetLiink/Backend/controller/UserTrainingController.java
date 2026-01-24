package com.vetLiink.Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.dto.UserTrainingDTO;
import com.vetLiink.Backend.service.UserTrainingService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/user-trainings")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserTrainingController {
    
    private final UserTrainingService userTrainingService;

    @PostMapping("/{userId}/enroll/{trainingId}")
    public ResponseEntity<UserTrainingDTO> enrollUserInTraining(@PathVariable Long userId, @PathVariable Long trainingId) {
        try {
            UserTrainingDTO enrollment = userTrainingService.enrollUserInTraining(userId, trainingId);
            return ResponseEntity.status(201).body(enrollment);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserTrainingDTO>> getUserTrainings(@PathVariable Long userId) {
        try {
            List<UserTrainingDTO> trainings = userTrainingService.getUserTrainings(userId);
            return ResponseEntity.ok(trainings);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/{userId}/status/{status}")
    public ResponseEntity<List<UserTrainingDTO>> getUserTrainingsByStatus(@PathVariable Long userId, @PathVariable String status) {
        try {
            List<UserTrainingDTO> trainings = userTrainingService.getUserTrainingsByStatus(userId, status);
            return ResponseEntity.ok(trainings);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<UserTrainingDTO> updateProgress(@PathVariable Long id, @RequestParam Double progressPercentage) {
        try {
            UserTrainingDTO updated = userTrainingService.updateProgress(id, progressPercentage);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<UserTrainingDTO> markComplete(@PathVariable Long id, @RequestParam Integer score) {
        try {
            UserTrainingDTO updated = userTrainingService.markComplete(id, score);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/enrollment/{id}")
    public ResponseEntity<UserTrainingDTO> getEnrollmentById(@PathVariable Long id) {
        try {
            UserTrainingDTO enrollment = userTrainingService.getEnrollmentById(id);
            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @PutMapping("/{id}/reset")
    public ResponseEntity<UserTrainingDTO> resetEnrollment(@PathVariable Long id) {
        try {
            UserTrainingDTO reset = userTrainingService.resetEnrollment(id);
            return ResponseEntity.ok(reset);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(null);
        }
    }
}
