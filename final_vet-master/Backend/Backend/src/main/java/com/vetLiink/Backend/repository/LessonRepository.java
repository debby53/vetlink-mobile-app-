package com.vetLiink.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.vetLiink.Backend.entity.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTrainingIdOrderBySequenceOrderAsc(Long trainingId);
    
    @Query("SELECT l FROM Lesson l LEFT JOIN FETCH l.training WHERE l.id = ?1")
    Optional<Lesson> findByIdWithTraining(Long id);
}
