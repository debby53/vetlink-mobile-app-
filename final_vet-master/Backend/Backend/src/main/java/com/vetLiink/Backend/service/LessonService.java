package com.vetLiink.Backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.dto.UserLessonProgressDTO;
import com.vetLiink.Backend.entity.Lesson;
import com.vetLiink.Backend.entity.Training;
import com.vetLiink.Backend.entity.UserLessonProgress;
import com.vetLiink.Backend.entity.UserTraining;
import com.vetLiink.Backend.repository.LessonRepository;
import com.vetLiink.Backend.repository.TrainingRepository;
import com.vetLiink.Backend.repository.UserLessonProgressRepository;
import com.vetLiink.Backend.repository.UserTrainingRepository;

@Service
@Transactional
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private UserTrainingRepository userTrainingRepository;

    @Autowired
    private UserLessonProgressRepository userLessonProgressRepository;

    @Autowired
    private CertificationService certificationService;

    /**
     * Create a new lesson for a training course.
     */
    public Lesson createLesson(Long trainingId, Lesson lessonData) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training not found"));

        // Set default sequence order if not provided
        if (lessonData.getSequenceOrder() == null) {
            List<Lesson> existing = lessonRepository.findByTrainingIdOrderBySequenceOrderAsc(trainingId);
            lessonData.setSequenceOrder(existing.size() + 1);
        }

        lessonData.setTraining(training);
        Lesson savedLesson = lessonRepository.save(lessonData);
        
        // Update lesson count in parent training
        training.setLessons(training.getLessons() != null ? training.getLessons() + 1 : 1);
        trainingRepository.save(training);
        
        return savedLesson;
    }

    /**
     * Get all lessons for a training course.
     */
    public List<Lesson> getLessonsByTraining(Long trainingId) {
        return lessonRepository.findByTrainingIdOrderBySequenceOrderAsc(trainingId);
    }
    
    @Autowired
    private TranscriptionService transcriptionService;

    /**
     * Update the video URL for a lesson and trigger async transcription.
     */
    public Lesson updateLessonVideo(Long lessonId, String filename) {
        System.out.println("🎬 Updating lesson " + lessonId + " with video: " + filename);
        Lesson lesson = getLesson(lessonId);
        if (lesson == null) {
            System.err.println("❌ Lesson not found for update: " + lessonId);
            return null;
        }
        
        lesson.setVideoUrl(filename);
        System.out.println("   Set videoUrl to: " + filename);
        
        Lesson savedLesson = lessonRepository.save(lesson);
        System.out.println("   ✅ Lesson saved. Verified videoUrl in DB: " + savedLesson.getVideoUrl());
        
        // Also update the parent Training entity with the video URL for consistency
        try {
            Training training = savedLesson.getTraining();
            if (training != null) {
                training.setVideoUrl(filename);
                trainingRepository.save(training);
                System.out.println("   ✅ Training entity updated with video URL: " + filename);
            } else {
                System.out.println("   ⚠️ No training associated with this lesson");
            }
        } catch (Exception e) {
            System.err.println("   ⚠️ Error updating training video: " + e.getMessage());
        }

        // Trigger async transcription
        try {
            String uploadsPath = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "videos";
            java.io.File videoFile = java.nio.file.Paths.get(uploadsPath, filename).toFile();
            
            if (videoFile.exists()) {
                System.out.println("   Video file exists, triggering transcription...");
                transcriptionService.transcribeVideo(videoFile).thenAccept(transcript -> {
                    if (transcript != null && !transcript.startsWith("Transcription disabled")) {
                        // Reload lesson to avoid optimistic locking issues or stale data
                        lessonRepository.findById(lessonId).ifPresent(l -> {
                            l.setTranscript(transcript);
                            lessonRepository.save(l);
                            System.out.println("   ✅ Transcript saved for lesson " + lessonId);
                        });
                    }
                });
            } else {
                System.err.println("   ⚠️ Video file not found at: " + videoFile.getAbsolutePath());
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger transcription: " + e.getMessage());
            e.printStackTrace();
        }

        return savedLesson;
    }

    /**
     * Get a specific lesson.
     */
    public Lesson getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    /**
     * Update a lesson.
     */
    public Lesson updateLesson(Long lessonId, Lesson lessonUpdates) {
        Lesson lesson = getLesson(lessonId);
        
        if (lessonUpdates.getTitle() != null) {
            lesson.setTitle(lessonUpdates.getTitle());
        }
        if (lessonUpdates.getDescription() != null) {
            lesson.setDescription(lessonUpdates.getDescription());
        }
        if (lessonUpdates.getSequenceOrder() != null) {
            lesson.setSequenceOrder(lessonUpdates.getSequenceOrder());
        }
        if (lessonUpdates.getDuration() != null) {
            lesson.setDuration(lessonUpdates.getDuration());
        }
        if (lessonUpdates.getDurationSeconds() != null) {
            lesson.setDurationSeconds(lessonUpdates.getDurationSeconds());
        }
        
        return lessonRepository.save(lesson);
    }

    /**
     * Mark a lesson as completed for a user (via their enrollment/userTraining).
     */
    public UserLessonProgressDTO markLessonComplete(Long enrollmentId, Long lessonId, Integer stoppedAtSeconds) {
        UserTraining enrollment = userTrainingRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Find or create progress record
        UserLessonProgress progress = userLessonProgressRepository.findByUserTrainingIdAndLessonId(enrollmentId, lessonId)
                .orElse(UserLessonProgress.builder()
                        .userTraining(enrollment)
                        .lesson(lesson)
                        .completed(false)
                        .build());

        progress.setCompleted(true);
        if (stoppedAtSeconds != null) {
            progress.setStoppedAtSeconds(stoppedAtSeconds);
        }
        
        UserLessonProgress saved = userLessonProgressRepository.save(progress);

        // Update overall course progress
        updateOverallProgress(enrollment);
        
        // Check if all lessons are now complete
        boolean courseCompleted = isEnrollmentComplete(enrollmentId);

        UserTraining refreshedEnrollment = userTrainingRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        return UserLessonProgressDTO.builder()
                .id(saved.getId())
                .userTrainingId(refreshedEnrollment.getId())
                .lessonId(lesson.getId())
                .completed(saved.getCompleted())
                .stoppedAtSeconds(saved.getStoppedAtSeconds())
                .updatedAt(saved.getUpdatedAt())
                .progressPercentage(refreshedEnrollment.getProgressPercentage())
                .enrollmentStatus(refreshedEnrollment.getStatus().name())
                .courseCompleted(courseCompleted)
                .build();
    }

    /**
     * Calculate and update the overall progress percentage for the enrollment.
     */
    private void updateOverallProgress(UserTraining enrollment) {
        List<Lesson> allLessons = lessonRepository.findByTrainingIdOrderBySequenceOrderAsc(enrollment.getTraining().getId());
        if (allLessons.isEmpty()) return;

        List<UserLessonProgress> progressList = userLessonProgressRepository.findByUserTrainingId(enrollment.getId());
        
        long completedCount = progressList.stream()
                .filter(UserLessonProgress::getCompleted)
                .count();

        double percentage = ((double) completedCount / allLessons.size()) * 100.0;
        
        // Cap at 100%
        percentage = Math.min(percentage, 100.0);
        
        enrollment.setProgressPercentage(percentage);
        
        if (percentage >= 100.0 && enrollment.getStatus() != UserTraining.EnrollmentStatus.COMPLETED) {
             // Let the specific completion endpoint handle the strict COMPLETE status change if needed, 
             // but we can set it here or at least ensure progress is maxed.
        }
        
        userTrainingRepository.save(enrollment);
    }

    public void deleteLesson(Long lessonId) {
        Lesson lesson = getLesson(lessonId);
        Training training = lesson.getTraining();
        
        lessonRepository.delete(lesson);
        
        // Decr count
        if (training.getLessons() > 0) {
             training.setLessons(training.getLessons() - 1);
             trainingRepository.save(training);
        }
    }
    
    /**
     * Check if all lessons are completed for an enrollment and generate certificate
     */
    public boolean isEnrollmentComplete(Long enrollmentId) {
        UserTraining enrollment = userTrainingRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        Training training = enrollment.getTraining();
        List<Lesson> allLessons = lessonRepository.findByTrainingIdOrderBySequenceOrderAsc(training.getId());
        
        if (allLessons.isEmpty()) {
            System.out.println("⚠️ No lessons found for training " + training.getId());
            return false;
        }
        
        List<UserLessonProgress> progressList = userLessonProgressRepository.findByUserTrainingId(enrollmentId);
        long completedCount = progressList.stream()
                .filter(UserLessonProgress::getCompleted)
                .count();
        
        boolean isComplete = completedCount == allLessons.size();
        
        if (isComplete) {
            System.out.println("✅ All lessons completed! Enrollment " + enrollmentId + " is 100% complete");
            
            // Update enrollment status to COMPLETED
            enrollment.setStatus(UserTraining.EnrollmentStatus.COMPLETED);
            enrollment.setProgressPercentage(100.0);
            userTrainingRepository.save(enrollment);

            // 🎉 GENERATE CERTIFICATE AUTOMATICALLY
            try {
                certificationService.generateCertificateForCompletion(enrollmentId);
                System.out.println("✅ Certificate automatically generated for enrollment " + enrollmentId);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to generate certificate: " + e.getMessage());
                // Don't fail the completion if certificate generation fails
            }
            
            System.out.println("✅ Certificate eligible for enrollment " + enrollmentId);
        }
        
        return isComplete;
    }
}
