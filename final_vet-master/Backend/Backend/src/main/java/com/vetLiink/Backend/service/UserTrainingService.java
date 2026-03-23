package com.vetLiink.Backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.dto.UserTrainingDTO;
import com.vetLiink.Backend.entity.Training;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserLessonProgress;
import com.vetLiink.Backend.entity.UserTraining;
import com.vetLiink.Backend.repository.LessonRepository;
import com.vetLiink.Backend.repository.TrainingRepository;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.repository.UserTrainingRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserTrainingService {
    private final UserTrainingRepository userTrainingRepository;
    private final UserRepository userRepository;
    private final TrainingRepository trainingRepository;
    private final LessonRepository lessonRepository;

    public UserTrainingDTO enrollUserInTraining(Long userId, Long trainingId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training not found"));

        // Check if already enrolled
        if (userTrainingRepository.findByUserIdAndTrainingId(userId, trainingId).isPresent()) {
            throw new RuntimeException("User already enrolled in this training");
        }

        UserTraining userTraining = UserTraining.builder()
                .user(user)
                .training(training)
                .status(UserTraining.EnrollmentStatus.NOT_STARTED)
                .progressPercentage(0.0)
                .build();

        UserTraining savedUserTraining = userTrainingRepository.save(userTraining);
        return convertToDTO(savedUserTraining);
    }

    @Transactional(readOnly = true)
    public List<UserTrainingDTO> getUserTrainings(Long userId) {
        return userTrainingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserTrainingDTO> getUserTrainingsByStatus(Long userId, String status) {
        return userTrainingRepository.findByUserIdAndStatus(userId, UserTraining.EnrollmentStatus.valueOf(status)).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserTrainingDTO updateProgress(Long userTrainingId, Double progressPercentage) {
        UserTraining userTraining = userTrainingRepository.findById(userTrainingId)
                .orElseThrow(() -> new RuntimeException("User training not found"));

        userTraining.setProgressPercentage(progressPercentage);
        
        if (progressPercentage >= 100.0) {
            userTraining.setStatus(UserTraining.EnrollmentStatus.COMPLETED);
        } else if (progressPercentage > 0) {
            userTraining.setStatus(UserTraining.EnrollmentStatus.IN_PROGRESS);
        }

        UserTraining updatedUserTraining = userTrainingRepository.save(userTraining);
        return convertToDTO(updatedUserTraining);
    }

    public UserTrainingDTO markComplete(Long userTrainingId, Integer score) {
        UserTraining userTraining = userTrainingRepository.findById(userTrainingId)
                .orElseThrow(() -> new RuntimeException("User training not found"));

        userTraining.setStatus(UserTraining.EnrollmentStatus.COMPLETED);
        userTraining.setProgressPercentage(100.0);
        userTraining.setScore(score);
        userTraining.setCompletedAt(java.time.LocalDateTime.now());

        UserTraining updatedUserTraining = userTrainingRepository.save(userTraining);
        return convertToDTO(updatedUserTraining);
    }

    @Transactional(readOnly = true)
    public UserTrainingDTO getEnrollmentById(Long id) {
        UserTraining userTraining = userTrainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        return convertToDTO(userTraining);
    }

    public UserTrainingDTO resetEnrollment(Long userTrainingId) {
        UserTraining userTraining = userTrainingRepository.findById(userTrainingId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Reset enrollment to allow resume from beginning
        userTraining.setStatus(UserTraining.EnrollmentStatus.IN_PROGRESS);
        userTraining.setProgressPercentage(0.0);
        userTraining.setScore(null);
        userTraining.setCompletedAt(null);

        UserTraining resetUserTraining = userTrainingRepository.save(userTraining);
        return convertToDTO(resetUserTraining);
    }

    @Transactional(readOnly = true)
    public List<UserTrainingDTO> getTrainingEnrollments(Long trainingId) {
        return userTrainingRepository.findByTrainingId(trainingId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserTrainingDTO convertToDTO(UserTraining userTraining) {
        Training training = userTraining.getTraining();
        Long trainingId = training != null ? training.getId() : null;

        int totalLessons = 0;
        if (trainingId != null) {
            totalLessons = lessonRepository
                    .findByTrainingIdOrderBySequenceOrderAsc(trainingId)
                    .size();
        }

        int completedLessons = 0;
        if (userTraining.getLessonProgress() != null) {
            completedLessons = (int) userTraining.getLessonProgress().stream()
                    .filter(progress -> Boolean.TRUE.equals(progress.getCompleted()))
                    .count();
        }

        double progressPercentage = userTraining.getStatus() == UserTraining.EnrollmentStatus.COMPLETED
                ? 100.0
                : (userTraining.getProgressPercentage() != null ? userTraining.getProgressPercentage() : 0.0);

        String instructorName = null;
        try {
            if (training != null && training.getInstructor() != null) {
                instructorName = training.getInstructor().getName();
            }
        } catch (Exception e) {
            System.err.println("Could not load training instructor: " + e.getMessage());
        }

        return UserTrainingDTO.builder()
                .id(userTraining.getId())
                .userId(userTraining.getUser().getId())
                .userName(userTraining.getUser().getName())
                .userEmail(userTraining.getUser().getEmail())
                .userRole(userTraining.getUser().getRole() != null ? userTraining.getUser().getRole().toString() : null)
                .trainingId(trainingId)
                .trainingTitle(training != null ? training.getTitle() : null)
                .trainingCategory(training != null ? training.getCategory() : null)
                .trainingDuration(training != null ? training.getDuration() : null)
                .trainingLessons(totalLessons)
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .instructorName(instructorName)
                .status(userTraining.getStatus().toString())
                .progressPercentage(progressPercentage)
                .score(userTraining.getScore())
                .enrolledAt(userTraining.getEnrolledAt() != null ? userTraining.getEnrolledAt().toString() : null)
                .completedAt(userTraining.getCompletedAt() != null ? userTraining.getCompletedAt().toString() : null)
                .videoUrl(training != null ? training.getVideoUrl() : null)
                .build();
    }
}
