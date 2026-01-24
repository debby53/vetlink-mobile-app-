package com.vetLiink.Backend.service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.dto.TrainingDTO;
import com.vetLiink.Backend.entity.Training;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.TrainingRepository;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TrainingService {
    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;

    /**
     * Parses duration string (e.g., "8 hours") and extracts numeric value
     */
    private Integer parseDurationHours(String durationString) {
        if (durationString == null || durationString.trim().isEmpty()) {
            return null;
        }
        Pattern pattern = Pattern.compile("(\\d+)");
        Matcher matcher = pattern.matcher(durationString);
        if (matcher.find()) {
            return Integer.valueOf(matcher.group(1));
        }
        return null;
    }

    public TrainingDTO createTraining(TrainingDTO trainingDTO) {
        User instructor = userRepository.findById(trainingDTO.getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Integer durationHours = parseDurationHours(trainingDTO.getDuration());

        Training training = Training.builder()
                .title(trainingDTO.getTitle())
                .description(trainingDTO.getDescription())
                .content(trainingDTO.getContent())
                .category(trainingDTO.getCategory())
                .duration(trainingDTO.getDuration()) // Store the original string
                .durationHours(durationHours) // Store parsed numeric value
                .lessons(trainingDTO.getLessons())
                .instructor(instructor)
                .status(Training.TrainingStatus.valueOf(trainingDTO.getStatus() != null ? trainingDTO.getStatus() : "DRAFT"))
                .videoUrl(trainingDTO.getVideoUrl())
                .materials(trainingDTO.getMaterials())
                .build();

        Training savedTraining = trainingRepository.save(training);
        return convertToDTO(savedTraining);
    }

    public TrainingDTO getTrainingById(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found"));
        return convertToDTO(training);
    }

    @Transactional(readOnly = true)
    public List<TrainingDTO> getTrainingsByCategory(String category) {
        return trainingRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainingDTO> getPublishedTrainings() {
        return trainingRepository.findByStatusOrderByCreatedAtDesc(Training.TrainingStatus.PUBLISHED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainingDTO> getTrainingsByInstructor(Long instructorId) {
        return trainingRepository.findByInstructorId(instructorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrainingDTO updateTraining(Long id, TrainingDTO trainingDTO) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found"));

        // Validate that training has required fields
        if (training.getTitle() == null || training.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Training title cannot be null or empty");
        }
        if (training.getDescription() == null || training.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Training description cannot be null or empty");
        }

        // Only update fields that are provided (not null) and don't set required fields to null
        if (trainingDTO.getTitle() != null && !trainingDTO.getTitle().trim().isEmpty()) {
            training.setTitle(trainingDTO.getTitle());
        }
        if (trainingDTO.getDescription() != null && !trainingDTO.getDescription().trim().isEmpty()) {
            training.setDescription(trainingDTO.getDescription());
        }
        if (trainingDTO.getContent() != null) {
            training.setContent(trainingDTO.getContent());
        }
        if (trainingDTO.getCategory() != null) {
            training.setCategory(trainingDTO.getCategory());
        }
        if (trainingDTO.getDuration() != null) {
            training.setDuration(trainingDTO.getDuration());
            training.setDurationHours(parseDurationHours(trainingDTO.getDuration()));
        }
        if (trainingDTO.getLessons() != null) {
            training.setLessons(trainingDTO.getLessons());
        }
        if (trainingDTO.getVideoUrl() != null) {
            training.setVideoUrl(trainingDTO.getVideoUrl());
        }
        if (trainingDTO.getMaterials() != null) {
            training.setMaterials(trainingDTO.getMaterials());
        }
        if (trainingDTO.getStatus() != null) {
            try {
                training.setStatus(Training.TrainingStatus.valueOf(trainingDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + trainingDTO.getStatus());
            }
        }

        Training updatedTraining = trainingRepository.save(training);
        return convertToDTO(updatedTraining);
    }

    public void deleteTraining(Long id) {
        trainingRepository.deleteById(id);
    }

    private TrainingDTO convertToDTO(Training training) {
        Long instructorId = null;
        String instructorName = null;
        
        try {
            if (training.getInstructor() != null) {
                instructorId = training.getInstructor().getId();
                instructorName = training.getInstructor().getName();
            }
        } catch (Exception e) {
            // Handle lazy loading exception
            System.err.println("Could not load instructor: " + e.getMessage());
        }
        
        String statusString = null;
        try {
            if (training.getStatus() != null) {
                statusString = training.getStatus().toString();
            } else {
                statusString = "DRAFT"; // Default status
            }
        } catch (Exception e) {
            statusString = "DRAFT";
        }
        
        return TrainingDTO.builder()
                .id(training.getId())
                .title(training.getTitle())
                .description(training.getDescription())
                .content(training.getContent())
                .category(training.getCategory())
                .duration(training.getDuration())
                .durationHours(training.getDurationHours())
                .lessons(training.getLessons())
                .instructorId(instructorId)
                .instructorName(instructorName)
                .status(statusString)
                .videoUrl(training.getVideoUrl())
                .materials(training.getMaterials())
                .build();
    }
}
