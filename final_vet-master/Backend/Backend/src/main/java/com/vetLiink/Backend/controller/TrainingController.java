package com.vetLiink.Backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetLiink.Backend.dto.TrainingDTO;
import com.vetLiink.Backend.dto.UserTrainingDTO;
import com.vetLiink.Backend.service.FileStorageService;
import com.vetLiink.Backend.service.TrainingService;
import com.vetLiink.Backend.service.UserTrainingService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/trainings")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class TrainingController {
    private final TrainingService trainingService;
    private final UserTrainingService userTrainingService;
    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createTraining(@RequestBody TrainingDTO trainingDTO) {
        try {
            TrainingDTO newTraining = trainingService.createTraining(trainingDTO);
            return ResponseEntity.status(201).body(newTraining);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create training: " + e.getMessage(), e);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createTrainingWithFile(
            @RequestPart(value = "training", required = false) String trainingJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            TrainingDTO trainingDTO = trainingJson != null ? mapper.readValue(trainingJson, TrainingDTO.class) : new TrainingDTO();

            if (file != null && !file.isEmpty()) {
                String stored = fileStorageService.store(file);
                trainingDTO.setVideoUrl(stored);
            }

            TrainingDTO newTraining = trainingService.createTraining(trainingDTO);
            return ResponseEntity.status(201).body(newTraining);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create training: " + e.getMessage(), e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingDTO> getTrainingById(@PathVariable Long id) {
        try {
            TrainingDTO training = trainingService.getTrainingById(id);
            return ResponseEntity.ok(training);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TrainingDTO>> getTrainingsByCategory(@PathVariable String category) {
        List<TrainingDTO> trainings = trainingService.getTrainingsByCategory(category);
        return ResponseEntity.ok(trainings);
    }

    @GetMapping("/published")
    public ResponseEntity<List<TrainingDTO>> getPublishedTrainings() {
        List<TrainingDTO> trainings = trainingService.getPublishedTrainings();
        return ResponseEntity.ok(trainings);
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<TrainingDTO>> getTrainingsByInstructor(@PathVariable Long instructorId) {
        List<TrainingDTO> trainings = trainingService.getTrainingsByInstructor(instructorId);
        return ResponseEntity.ok(trainings);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTraining(@PathVariable Long id, @RequestBody TrainingDTO trainingDTO) {
        try {
            TrainingDTO updatedTraining = trainingService.updateTraining(id, trainingDTO);
            return ResponseEntity.ok(updatedTraining);
        } catch (Exception e) {
            System.err.println("Error updating training: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                "error", "Failed to update training",
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTraining(@PathVariable Long id) {
        try {
            trainingService.deleteTraining(id);
            return ResponseEntity.ok("Training deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Training not found");
        }
    }

    @GetMapping("/{trainingId}/enrollments")
    public ResponseEntity<List<UserTrainingDTO>> getTrainingEnrollments(@PathVariable Long trainingId) {
        List<UserTrainingDTO> enrollments = userTrainingService.getTrainingEnrollments(trainingId);
        return ResponseEntity.ok(enrollments);
    }
}
