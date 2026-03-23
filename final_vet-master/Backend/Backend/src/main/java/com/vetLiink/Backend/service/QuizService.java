package com.vetLiink.Backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.entity.Lesson;
import com.vetLiink.Backend.entity.Quiz;
import com.vetLiink.Backend.entity.QuizQuestion;
import com.vetLiink.Backend.repository.LessonRepository;
import com.vetLiink.Backend.repository.QuizRepository;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private CertificationService certificationService;

    @Transactional
    public Quiz createOrUpdateQuiz(Long lessonId, Quiz quizData) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<Quiz> existingQuiz = quizRepository.findByLessonId(lessonId);

        Quiz quiz;
        if (existingQuiz.isPresent()) {
            quiz = existingQuiz.get();
            // Update existing quiz (rudimentary update for now)
            quiz.setPassingScore(quizData.getPassingScore());
            quiz.getQuestions().clear();
            if (quizData.getQuestions() != null) {
                quiz.getQuestions().addAll(quizData.getQuestions());
            }
        } else {
            quiz = quizData;
            quiz.setLesson(lesson);
        }

        // Link questions to quiz
        if (quiz.getQuestions() != null) {
            for (QuizQuestion q : quiz.getQuestions()) {
                q.setQuiz(quiz);
            }
        }

        return quizRepository.save(quiz);
    }

    public Quiz getQuizByLesson(Long lessonId) {
        return quizRepository.findByLessonId(lessonId)
                .orElse(null);
    }

    @Transactional
    public Quiz updateQuiz(Long quizId, Quiz quizUpdates) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quizUpdates.getPassingScore() != null) {
            quiz.setPassingScore(quizUpdates.getPassingScore());
        }
        if (quizUpdates.getQuestions() != null) {
            quiz.getQuestions().clear();
            quiz.getQuestions().addAll(quizUpdates.getQuestions());
            for (QuizQuestion q : quiz.getQuestions()) {
                q.setQuiz(quiz);
            }
        }

        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quizRepository.delete(quiz);
    }
    
    // Simple evaluation logic
    public boolean evaluateQuiz(Long quizId, List<Integer> userAnswers) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) return true;
        if (userAnswers == null || userAnswers.size() != quiz.getQuestions().size()) return false;

        int correctCount = 0;
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            if (quiz.getQuestions().get(i).getCorrectAnswerIndex().equals(userAnswers.get(i))) {
                correctCount++;
            }
        }

        double score = (double) correctCount / quiz.getQuestions().size() * 100;
        return score >= quiz.getPassingScore();
    }
    
    /**
     * Mark lesson as complete after successful quiz submission
     */
    public void markLessonCompleteAfterQuiz(Long enrollmentId, Long lessonId) {
        lessonService.markLessonComplete(enrollmentId, lessonId, null);
        System.out.println("✅ Lesson " + lessonId + " marked complete after quiz pass");
        
        // Check if enrollment is now complete and generate certificate if needed
        try {
            boolean isComplete = lessonService.isEnrollmentComplete(enrollmentId);
            if (isComplete) {
                System.out.println("📜 Enrollment " + enrollmentId + " is now complete. Certificate generation triggered by LessonService.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error checking enrollment completion: " + e.getMessage());
        }
    }
}
