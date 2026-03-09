package com.vetLiink.Backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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

    public List<UserTrainingDTO> getUserTrainings(Long userId) {
        return userTrainingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

    public List<UserTrainingDTO> getTrainingEnrollments(Long trainingId) {
        return userTrainingRepository.findByTrainingId(trainingId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserTrainingDTO convertToDTO(UserTraining userTraining) {
        int totalLessons = lessonRepository
                .findByTrainingIdOrderBySequenceOrderAsc(userTraining.getTraining().getId())
                .size();
        int completedLessons = (int) userTraining.getLessonProgress().stream()
                .filter(UserLessonProgress::getCompleted)
                .count();
        double progressPercentage = userTraining.getStatus() == UserTraining.EnrollmentStatus.COMPLETED
                ? 100.0
                : (userTraining.getProgressPercentage() != null ? userTraining.getProgressPercentage() : 0.0);

        return UserTrainingDTO.builder()
                .id(userTraining.getId())
                .userId(userTraining.getUser().getId())
                .userName(userTraining.getUser().getName())
                .userEmail(userTraining.getUser().getEmail())
                .userRole(userTraining.getUser().getRole() != null ? userTraining.getUser().getRole().toString() : null)
                .trainingId(userTraining.getTraining().getId())
                .trainingTitle(userTraining.getTraining().getTitle())
                .trainingCategory(userTraining.getTraining().getCategory())
                .trainingDuration(userTraining.getTraining().getDuration())
                .trainingLessons(totalLessons)
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .instructorName(userTraining.getTraining().getInstructor().getName())
                .status(userTraining.getStatus().toString())
                .progressPercentage(progressPercentage)
                .score(userTraining.getScore())
                .enrolledAt(userTraining.getEnrolledAt() != null ? userTraining.getEnrolledAt().toString() : null)
                .completedAt(userTraining.getCompletedAt() != null ? userTraining.getCompletedAt().toString() : null)
                .videoUrl(userTraining.getTraining().getVideoUrl())
                .build();
    }
}
