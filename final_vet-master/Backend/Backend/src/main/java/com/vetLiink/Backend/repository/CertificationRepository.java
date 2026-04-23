package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByUserId(Long userId);
    List<Certification> findByUserIdAndIsActive(Long userId, Boolean isActive);
    List<Certification> findByTitle(String title);
    void deleteByUserId(Long userId);
}
