package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.HealthRecordDTO;
import com.vetLiink.Backend.entity.HealthRecord;
import com.vetLiink.Backend.entity.Animal;
import com.vetLiink.Backend.repository.HealthRecordRepository;
import com.vetLiink.Backend.repository.AnimalRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class HealthRecordService {
    private final HealthRecordRepository healthRecordRepository;
    private final AnimalRepository animalRepository;

    public HealthRecordDTO createHealthRecord(HealthRecordDTO recordDTO) {
        Animal animal = animalRepository.findById(recordDTO.getAnimalId())
                .orElseThrow(() -> new RuntimeException("Animal not found"));

        HealthRecord record = HealthRecord.builder()
                .animal(animal)
                .recordType(recordDTO.getRecordType())
                .details(recordDTO.getDetails())
                .diagnosis(recordDTO.getDiagnosis())
                .treatment(recordDTO.getTreatment())
                .notes(recordDTO.getNotes())
                .weight(recordDTO.getWeight())
                .temperature(recordDTO.getTemperature())
                .build();

        HealthRecord savedRecord = healthRecordRepository.save(record);
        return convertToDTO(savedRecord);
    }

    public List<HealthRecordDTO> getRecordsByAnimalId(Long animalId) {
        return healthRecordRepository.findByAnimalIdOrderByRecordDateDesc(animalId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public HealthRecordDTO getRecordById(Long id) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));
        return convertToDTO(record);
    }

    public HealthRecordDTO updateHealthRecord(Long id, HealthRecordDTO recordDTO) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setDetails(recordDTO.getDetails());
        record.setDiagnosis(recordDTO.getDiagnosis());
        record.setTreatment(recordDTO.getTreatment());
        record.setNotes(recordDTO.getNotes());
        record.setWeight(recordDTO.getWeight());
        record.setTemperature(recordDTO.getTemperature());

        HealthRecord updatedRecord = healthRecordRepository.save(record);
        return convertToDTO(updatedRecord);
    }

    public void deleteHealthRecord(Long id) {
        healthRecordRepository.deleteById(id);
    }

    private HealthRecordDTO convertToDTO(HealthRecord record) {
        return HealthRecordDTO.builder()
                .id(record.getId())
                .animalId(record.getAnimal().getId())
                .recordType(record.getRecordType())
                .details(record.getDetails())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .notes(record.getNotes())
                .weight(record.getWeight())
                .temperature(record.getTemperature())
                .recordDate(record.getRecordDate())
                .build();
    }
}
