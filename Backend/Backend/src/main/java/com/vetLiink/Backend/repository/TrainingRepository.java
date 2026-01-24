package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
    List<Training> findByCategory(String category);
    List<Training> findByInstructorId(Long instructorId);
    List<Training> findByStatus(Training.TrainingStatus status);
    List<Training> findByStatusOrderByCreatedAtDesc(Training.TrainingStatus status);
}
