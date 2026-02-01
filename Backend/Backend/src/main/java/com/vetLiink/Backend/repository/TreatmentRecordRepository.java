package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByCahwId(Long cahwId);
    List<TreatmentRecord> findByAnimalId(Long animalId);
}
