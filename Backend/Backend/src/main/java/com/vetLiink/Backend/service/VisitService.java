package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.VisitDTO;
import com.vetLiink.Backend.entity.*;
import com.vetLiink.Backend.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class VisitService {
    private final VisitRepository visitRepository;
    private final UserRepository userRepository;
    private final CaseRepository caseRepository;
    private final AnimalRepository animalRepository;

    public VisitDTO createVisit(VisitDTO visitDTO) {
        User veterinarian = userRepository.findById(visitDTO.getVeterinarianId())
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        User farmer = userRepository.findById(visitDTO.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Visit visit = Visit.builder()
                .veterinarian(veterinarian)
                .farmer(farmer)
                .purpose(visitDTO.getPurpose())
                .notes(visitDTO.getNotes())
                .location(visitDTO.getLocation())
                .scheduledDate(visitDTO.getScheduledDate())
                .status(Visit.VisitStatus.SCHEDULED)
                .build();

        if (visitDTO.getCaseId() != null) {
            Case caze = caseRepository.findById(visitDTO.getCaseId())
                    .orElseThrow(() -> new RuntimeException("Case not found"));
            visit.setCaze(caze);
        }

        if (visitDTO.getAnimalId() != null) {
            Animal animal = animalRepository.findById(visitDTO.getAnimalId())
                    .orElseThrow(() -> new RuntimeException("Animal not found"));
            visit.setAnimal(animal);
        }

        Visit savedVisit = visitRepository.save(visit);
        return convertToDTO(savedVisit);
    }

    public VisitDTO getVisitById(Long id) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));
        return convertToDTO(visit);
    }

    @Transactional(readOnly = true)
    public List<VisitDTO> getVisitsByVeterinarianId(Long veterinarianId) {
        return visitRepository.findByVeterinarianIdOrderByScheduledDateDesc(veterinarianId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VisitDTO> getVisitsByFarmerId(Long farmerId) {
        return visitRepository.findByFarmerIdOrderByScheduledDateDesc(farmerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VisitDTO> getScheduledVisitsByVeterinarianId(Long veterinarianId) {
        return visitRepository.findByVeterinarianIdAndStatus(veterinarianId, Visit.VisitStatus.SCHEDULED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VisitDTO> getScheduledVisitsByFarmerId(Long farmerId) {
        return visitRepository.findByFarmerIdAndStatus(farmerId, Visit.VisitStatus.SCHEDULED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public VisitDTO updateVisit(Long visitId, VisitDTO visitDTO) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        visit.setPurpose(visitDTO.getPurpose());
        visit.setNotes(visitDTO.getNotes());
        visit.setLocation(visitDTO.getLocation());
        visit.setScheduledDate(visitDTO.getScheduledDate());

        if (visitDTO.getStatus() != null) {
            try {
                visit.setStatus(Visit.VisitStatus.valueOf(visitDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid visit status: " + visitDTO.getStatus());
            }
        }

        if (visitDTO.getActualDate() != null) {
            visit.setActualDate(visitDTO.getActualDate());
        }

        Visit updatedVisit = visitRepository.save(visit);
        return convertToDTO(updatedVisit);
    }

    public void deleteVisit(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found"));
        visitRepository.delete(visit);
    }

    @Transactional(readOnly = true)
    public List<VisitDTO> getVisitsByCase(Long caseId) {
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        return visitRepository.findByCaze(caze).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void completeVisit(Long visitId, LocalDateTime actualDate) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found"));
        visit.setStatus(Visit.VisitStatus.COMPLETED);
        visit.setActualDate(actualDate != null ? actualDate : LocalDateTime.now());
        visitRepository.save(visit);
    }

    public void cancelVisit(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found"));
        visit.setStatus(Visit.VisitStatus.CANCELLED);
        visitRepository.save(visit);
    }

    private VisitDTO convertToDTO(Visit visit) {
        return VisitDTO.builder()
                .id(visit.getId())
                .caseId(visit.getCaze() != null ? visit.getCaze().getId() : null)
                .veterinarianId(visit.getVeterinarian().getId())
                .farmerId(visit.getFarmer().getId())
                .animalId(visit.getAnimal() != null ? visit.getAnimal().getId() : null)
                .scheduledDate(visit.getScheduledDate())
                .actualDate(visit.getActualDate())
                .purpose(visit.getPurpose())
                .notes(visit.getNotes())
                .status(visit.getStatus().toString())
                .location(visit.getLocation())
                .createdAt(visit.getCreatedAt())
                .updatedAt(visit.getUpdatedAt())
                .build();
    }
}
