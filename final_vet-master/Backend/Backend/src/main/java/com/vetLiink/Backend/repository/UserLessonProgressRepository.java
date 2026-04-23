package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    Optional<UserLessonProgress> findByUserTrainingIdAndLessonId(Long userTrainingId, Long lessonId);
    List<UserLessonProgress> findByUserTrainingId(Long userTrainingId);
}
