package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByAnimalId(Long animalId);
    List<HealthRecord> findByAnimalIdOrderByRecordDateDesc(Long animalId);
    List<HealthRecord> findByRecordType(String recordType);
}
