package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.UserTraining;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTrainingRepository extends JpaRepository<UserTraining, Long> {
    List<UserTraining> findByUserId(Long userId);
    List<UserTraining> findByUserIdAndStatus(Long userId, UserTraining.EnrollmentStatus status);
    List<UserTraining> findByTrainingId(Long trainingId);
    Optional<UserTraining> findByUserIdAndTrainingId(Long userId, Long trainingId);
}
