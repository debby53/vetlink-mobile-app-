package com.vetLiink.Backend.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.entity.Quiz;
import com.vetLiink.Backend.service.QuizService;

@RestController
@RequestMapping("/api/lessons/{lessonId}/quiz")
@CrossOrigin(origins = "*") // Allow all for dev
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long lessonId) {
        Quiz quiz = quizService.getQuizByLesson(lessonId);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(quiz);
    }

    @PostMapping
    public ResponseEntity<Quiz> createOrUpdateQuiz(@PathVariable Long lessonId, @RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.createOrUpdateQuiz(lessonId, quiz));
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long lessonId, @PathVariable Long quizId, @RequestBody Quiz quiz) {
        try {
            return ResponseEntity.ok(quizService.updateQuiz(quizId, quiz));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long lessonId, @PathVariable Long quizId) {
        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.ok("Quiz deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long lessonId, @RequestBody Map<String, Object> payload) {
        try {
            Long quizId = Long.valueOf(payload.get("quizId").toString());
            Long enrollmentId = Long.valueOf(payload.get("enrollmentId").toString());
            Object answersObj = payload.get("answers");
            List<Integer> answers = new java.util.ArrayList<>();
            if (answersObj instanceof List<?>) {
                for (Object o : (List<?>) answersObj) {
                    if (o instanceof Integer) {
                        answers.add((Integer) o);
                    } else if (o instanceof Number) {
                        answers.add(((Number) o).intValue());
                    } else if (o != null) {
                        try {
                            answers.add(Integer.parseInt(o.toString()));
                        } catch (Exception ex) {
                            // skip invalid
                        }
                    }
                }
            }

            boolean passed = quizService.evaluateQuiz(quizId, answers);

            Map<String, Object> response = new HashMap<>();
            response.put("passed", passed);
            response.put("message", passed ? "Congratulations! You passed." : "You did not achieve the passing score. Please try again.");
            response.put("lessonCompleted", false);

            // If quiz passed, mark lesson as complete
            if (passed && enrollmentId != null) {
                try {
                    quizService.markLessonCompleteAfterQuiz(enrollmentId, lessonId);
                    response.put("lessonCompleted", true);
                    System.out.println("✅ Quiz passed and lesson marked complete for enrollment: " + enrollmentId);
                } catch (Exception e) {
                    System.err.println("⚠️ Could not mark lesson complete: " + e.getMessage());
                    e.printStackTrace();
                    response.put("lessonCompleted", false);
                }
            }

            System.out.println("📤 Returning quiz response: passed=" + passed + ", lessonCompleted=" + response.get("lessonCompleted"));
            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(response);
        } catch (Exception e) {
            System.err.println("❌ Quiz submission error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("passed", false);
            error.put("message", "Invalid submission: " + e.getMessage());
            error.put("lessonCompleted", false);
            return ResponseEntity
                .badRequest()
                .header("Content-Type", "application/json")
                .body(error);
        }
    }
}
