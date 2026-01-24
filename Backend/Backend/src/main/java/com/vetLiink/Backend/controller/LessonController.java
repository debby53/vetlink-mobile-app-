package com.vetLiink.Backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vetLiink.Backend.entity.Lesson;
import com.vetLiink.Backend.entity.UserLessonProgress;
import com.vetLiink.Backend.service.LessonService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    // Get all lessons for a specific training
    @GetMapping("/trainings/{trainingId}/lessons")
    public ResponseEntity<List<Lesson>> getLessons(@PathVariable Long trainingId) {
        return ResponseEntity.ok(lessonService.getLessonsByTraining(trainingId));
    }

    // Add a new lesson to a training
    @PostMapping("/trainings/{trainingId}/lessons")
    public ResponseEntity<Lesson> createLesson(@PathVariable Long trainingId, @RequestBody Lesson lesson) {
        return ResponseEntity.ok(lessonService.createLesson(trainingId, lesson));
    }

    // Get a specific lesson
    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<Lesson> getLesson(@PathVariable Long lessonId) {
        try {
            return ResponseEntity.ok(lessonService.getLesson(lessonId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update a lesson
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long lessonId, @RequestBody Lesson lesson) {
        try {
            Lesson updated = lessonService.updateLesson(lessonId, lesson);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete a lesson
    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<String> deleteLesson(@PathVariable Long lessonId) {
        try {
            lessonService.deleteLesson(lessonId);
            return ResponseEntity.ok("Lesson deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Upload video for a specific lesson
    @PostMapping("/lessons/{lessonId}/video")
    public ResponseEntity<?> uploadLessonVideo(@PathVariable Long lessonId, @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📹 Video upload request for lesson: " + lessonId);
            System.out.println("   File name: " + file.getOriginalFilename());
            System.out.println("   File size: " + file.getSize() + " bytes");
            
            Lesson lesson = lessonService.getLesson(lessonId);
            if (lesson == null) {
                System.err.println("❌ Lesson not found: " + lessonId);
                return ResponseEntity.notFound().build();
            }
            
            // Basic file validation
            if (file.isEmpty()) {
                System.err.println("❌ File is empty");
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }
            
            // Save file
            String uploadsPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "videos";
            File uploadDir = new File(uploadsPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
                System.out.println("   Created uploads directory: " + uploadsPath);
            }
            
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path path = Paths.get(uploadsPath, filename);
            file.transferTo(path.toFile());
            System.out.println("   ✅ File saved to: " + path.toAbsolutePath());
            
            // Check and fix audio if needed
            try {
                String videoFilePath = path.toAbsolutePath().toString();
                System.out.println("   🔍 Checking for audio track...");
                
                // Import at top of file: import com.vetLiink.Backend.util.VideoAudioUtil;
                if (!com.vetLiink.Backend.util.VideoAudioUtil.hasAudioTrack(videoFilePath)) {
                    System.out.println("   ⚠️  No audio detected, attempting to add audio...");
                    if (com.vetLiink.Backend.util.VideoAudioUtil.isFFmpegAvailable()) {
                        boolean success = com.vetLiink.Backend.util.VideoAudioUtil.addSilentAudio(videoFilePath);
                        if (success) {
                            System.out.println("   ✅ Audio track added successfully");
                        } else {
                            System.out.println("   ⚠️  Could not add audio (FFmpeg issue), continuing with video-only");
                        }
                    } else {
                        System.out.println("   ℹ️  FFmpeg not available - install to auto-fix audio");
                        System.out.println("      Install: choco install ffmpeg OR download from ffmpeg.org");
                    }
                } else {
                    System.out.println("   ✅ Audio track detected in uploaded video");
                }
            } catch (Exception e) {
                System.err.println("   ⚠️  Error processing audio: " + e.getMessage());
                // Don't fail the upload, just log the warning
            }
            
            // Update lesson record
            Lesson updatedLesson = lessonService.updateLessonVideo(lessonId, filename);
            System.out.println("   ✅ Lesson updated with video URL: " + updatedLesson.getVideoUrl());
            
            return ResponseEntity.ok(Map.of("message", "Upload successful", "filename", filename, "lesson", updatedLesson));
            
        } catch (IOException e) {
            System.err.println("❌ IOException during upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload video: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Exception during upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload video: " + e.getMessage());
        }
    }

    // Fix audio for all videos (admin endpoint)
    @PostMapping("/admin/fix-video-audio")
    public ResponseEntity<?> fixVideoAudio() {
        try {
            String uploadsPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "videos";
            File videoDir = new File(uploadsPath);
            
            if (!videoDir.exists()) {
                return ResponseEntity.badRequest().body("Video directory not found");
            }
            
            if (!com.vetLiink.Backend.util.VideoAudioUtil.isFFmpegAvailable()) {
                return ResponseEntity.badRequest().body("FFmpeg not installed. Install from ffmpeg.org or use: choco install ffmpeg");
            }
            
            File[] videos = videoDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".mp4"));
            if (videos == null || videos.length == 0) {
                return ResponseEntity.ok(Map.of("message", "No MP4 files found"));
            }
            
            int processed = 0;
            int fixed = 0;
            
            for (File video : videos) {
                processed++;
                String videoPath = video.getAbsolutePath();
                System.out.println("Processing: " + video.getName());
                
                if (!com.vetLiink.Backend.util.VideoAudioUtil.hasAudioTrack(videoPath)) {
                    if (com.vetLiink.Backend.util.VideoAudioUtil.addSilentAudio(videoPath)) {
                        fixed++;
                    }
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Video audio fix complete",
                "total_videos", processed,
                "videos_fixed", fixed
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // Mark lesson as complete
    @PostMapping("/enrollments/{enrollmentId}/lessons/{lessonId}/complete")
    public ResponseEntity<UserLessonProgress> completeLesson(
            @PathVariable Long enrollmentId,
            @PathVariable Long lessonId,
            @RequestBody(required = false) Map<String, Integer> body) {
        
        Integer stoppedAt = (body != null) ? body.get("stoppedAt") : null;
        return ResponseEntity.ok(lessonService.markLessonComplete(enrollmentId, lessonId, stoppedAt));
    }
    
    // Check if enrollment is complete and eligible for certificate
    @GetMapping("/enrollments/{enrollmentId}/check-completion")
    public ResponseEntity<Map<String, Object>> checkEnrollmentCompletion(@PathVariable Long enrollmentId) {
        try {
            boolean isComplete = lessonService.isEnrollmentComplete(enrollmentId);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("isComplete", isComplete);
            response.put("message", isComplete ? "Congratulations! You've completed all lessons and earned a certificate!" : "Keep learning to complete this course.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
