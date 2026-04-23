package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.CaseMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseMediaRepository extends JpaRepository<CaseMedia, Long> {
    List<CaseMedia> findByCazeId(Long caseId);
    
    void deleteByCazeId(Long caseId);
}
