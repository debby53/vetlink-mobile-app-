package com.vetLiink.Backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vetLiink.Backend.dto.CaseDTO;
import com.vetLiink.Backend.dto.CaseMediaDTO;
import com.vetLiink.Backend.entity.Animal;
import com.vetLiink.Backend.entity.Case;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.AnimalRepository;
import com.vetLiink.Backend.repository.CaseRepository;
import com.vetLiink.Backend.repository.LocationRepository;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CaseService {
    private final CaseRepository caseRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final LocationService locationService;
    private final NotificationService notificationService;

    public CaseDTO createCase(CaseDTO caseDTO) {
        Animal animal = animalRepository.findById(caseDTO.getAnimalId())
                .orElseThrow(() -> new RuntimeException("Animal not found"));
        User farmer = userRepository.findById(caseDTO.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        
        Location location = locationRepository.findById(caseDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Validate that the case location matches the farmer's location
        if (farmer.getLocation() != null && !farmer.getLocation().getId().equals(location.getId())) {
            throw new RuntimeException("Case location must match farmer's location");
        }

        Case newCase = Case.builder()
                .farmer(farmer)
                .animal(animal)
                .location(location)
                .title(caseDTO.getTitle())
                .description(caseDTO.getDescription())
                .caseType(caseDTO.getCaseType())
                .status(Case.CaseStatus.OPEN)
                .severity(caseDTO.getSeverity())
                .build();

        Case savedCase = caseRepository.save(newCase);
        
        // Notify about new case creation
        try {
            notificationService.createNotification(
                    farmer.getId(),
                    "Case Created Successfully",
                    "Your case '" + caseDTO.getTitle() + "' has been registered",
                    "INFO"
            );
        } catch (Exception e) {
            // Log but don't fail if notification fails
            System.err.println("Failed to create notification for case creation: " + e.getMessage());
        }
        
        return convertToDTO(savedCase);
    }

    @Transactional(readOnly = true)
    public CaseDTO getCaseById(Long id) {
        Case caze = caseRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));
        return convertToDTO(caze);
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getCasesByFarmerId(Long farmerId) {
        return caseRepository.findByFarmerId(farmerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getCasesByVeterinarianId(Long veterinarianId) {
        return caseRepository.findByVeterinarianId(veterinarianId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getCasesByCAHWId(Long cahwId) {
        return caseRepository.findByCahwId(cahwId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getAvailableCasesByLocation(Long locationId) {
        // Get all cases in this location that are either OPEN or ASSIGNED
        return caseRepository.findByLocationId(locationId).stream()
                .filter(c -> c.getStatus() == Case.CaseStatus.OPEN || c.getStatus() == Case.CaseStatus.ASSIGNED)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getEscalatedCases() {
        // Get all escalated cases
        return caseRepository.findAll().stream()
                .filter(c -> c.getIsEscalated() != null && c.getIsEscalated())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get cases in the same sector/location as the veterinarian/CAHW
    @Transactional(readOnly = true)
    public List<CaseDTO> getCasesByVeterinarianLocation(Long veterinarianId) {
        User veterinarian = userRepository.findById(veterinarianId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        
        if (veterinarian.getLocation() == null) {
            return List.of(); // Return empty list if veterinarian has no location
        }
        
        return caseRepository.findByLocationId(veterinarian.getLocation().getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaseDTO> getEscalatedCasesByVeterinarianLocation(Long veterinarianId) {
        User veterinarian = userRepository.findById(veterinarianId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        
        if (veterinarian.getLocation() == null) {
            return List.of(); // Return empty list if veterinarian has no location
        }
        
        return caseRepository.findByLocationId(veterinarian.getLocation().getId()).stream()
                .filter(c -> c.getIsEscalated() != null && c.getIsEscalated())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get cases in the same sector/location as the CAHW
    @Transactional(readOnly = true)
    public List<CaseDTO> getCasesByCAHWLocation(Long cahwId) {
        User cahw = userRepository.findById(cahwId)
                .orElseThrow(() -> new RuntimeException("CAHW not found"));
        
        if (cahw.getLocation() == null) {
            return List.of(); // Return empty list if CAHW has no location
        }
        
        return caseRepository.findByLocationId(cahw.getLocation().getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CaseDTO assignToCAHW(Long caseId, Long cahwId) {
        Case caze = caseRepository.findById(caseId).orElseThrow(() -> new RuntimeException("Case not found"));
        User cahw = userRepository.findById(cahwId).orElseThrow(() -> new RuntimeException("CAHW not found"));

        // Validate CAHW is in the same location as the case
        if (cahw.getLocation() != null && caze.getLocation() != null) {
            boolean sameVillage = locationService.validateLocationInSameVillage(cahw.getLocation(), caze.getLocation());
            if (!sameVillage) {
                throw new RuntimeException("CAHW must be in the same village to be assigned cases");
            }
        }

        caze.setCahw(cahw);
        caze.setStatus(Case.CaseStatus.ASSIGNED);
        Case updatedCase = caseRepository.save(caze);
        
        // Notify the CAHW about the assignment
        try {
            notificationService.createNotification(
                    cahw.getId(),
                    "Case Assigned to You",
                    "Case '" + caze.getTitle() + "' has been assigned to you",
                    "ALERT"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify CAHW: " + e.getMessage());
        }
        
        // Notify the farmer about the assignment
        try {
            notificationService.createNotification(
                    caze.getFarmer().getId(),
                    "Case Assigned to CAHW",
                    "Your case '" + caze.getTitle() + "' has been assigned to " + cahw.getName(),
                    "INFO"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify farmer: " + e.getMessage());
        }
        
        return convertToDTO(updatedCase);
    }

    public CaseDTO assignToVeterinarian(Long caseId, Long veterinarianId) {
        Case caze = caseRepository.findById(caseId).orElseThrow(() -> new RuntimeException("Case not found"));
        User vet = userRepository.findById(veterinarianId).orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        
        caze.setVeterinarian(vet);
        caze.setStatus(Case.CaseStatus.ASSIGNED);
        Case updatedCase = caseRepository.save(caze);
        
        // Notify the veterinarian about the assignment
        try {
            notificationService.createNotification(
                    vet.getId(),
                    "Case Assigned to You",
                    "Case '" + caze.getTitle() + "' has been assigned to you",
                    "ALERT"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify veterinarian: " + e.getMessage());
        }
        
        // Notify the CAHW if assigned
        if (caze.getCahw() != null) {
            try {
                notificationService.createNotification(
                        caze.getCahw().getId(),
                        "Veterinarian Assigned",
                        "Veterinarian " + vet.getName() + " has been assigned to case '" + caze.getTitle() + "'",
                        "INFO"
                );
            } catch (Exception e) {
                System.err.println("Failed to notify CAHW: " + e.getMessage());
            }
        }
        
        // Notify the farmer
        try {
            notificationService.createNotification(
                    caze.getFarmer().getId(),
                    "Veterinarian Assigned",
                    "Veterinarian " + vet.getName() + " has been assigned to your case '" + caze.getTitle() + "'",
                    "INFO"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify farmer: " + e.getMessage());
        }
        
        return convertToDTO(updatedCase);
    }

    public CaseDTO updateCase(Long caseId, CaseDTO caseDTO) {
        Case caze = caseRepository.findById(caseId).orElseThrow(() -> new RuntimeException("Case not found"));
        
        String previousStatus = caze.getStatus().toString();
        
        caze.setTitle(caseDTO.getTitle());
        caze.setDescription(caseDTO.getDescription());
        caze.setCaseType(caseDTO.getCaseType());
        caze.setDiagnosis(caseDTO.getDiagnosis());
        caze.setTreatment(caseDTO.getTreatment());
        caze.setSeverity(caseDTO.getSeverity());
        
        if (caseDTO.getStatus() != null) {
            caze.setStatus(Case.CaseStatus.valueOf(caseDTO.getStatus()));
        }

        Case updatedCase = caseRepository.save(caze);
        
        // Notify relevant users about status changes
        if (!previousStatus.equals(updatedCase.getStatus().toString())) {
            String statusChangeMessage = String.format("Case '%s' status changed to %s", caze.getTitle(), updatedCase.getStatus());
            
            // Notify farmer
            try {
                notificationService.createNotification(
                        caze.getFarmer().getId(),
                        "Case Status Updated",
                        statusChangeMessage,
                        "INFO"
                );
            } catch (Exception e) {
                System.err.println("Failed to notify farmer about status change: " + e.getMessage());
            }
            
            // Notify CAHW if assigned
            if (caze.getCahw() != null) {
                try {
                    notificationService.createNotification(
                            caze.getCahw().getId(),
                            "Case Status Updated",
                            statusChangeMessage,
                            "INFO"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify CAHW about status change: " + e.getMessage());
                }
            }
            
            // Notify veterinarian if assigned
            if (caze.getVeterinarian() != null) {
                try {
                    notificationService.createNotification(
                            caze.getVeterinarian().getId(),
                            "Case Status Updated",
                            statusChangeMessage,
                            "INFO"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify veterinarian about status change: " + e.getMessage());
                }
            }
        }
        
        return convertToDTO(updatedCase);
    }

    public void deleteCase(Long caseId) {
        caseRepository.deleteById(caseId);
    }

    // Mark case as received by veterinarian/CAHW
    @Transactional
    public CaseDTO markCaseAsReceived(Long caseId) {
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        
        caze.setStatus(Case.CaseStatus.RECEIVED);
        Case updatedCase = caseRepository.save(caze);
        
        // Notify farmer that case was received
        try {
            String message = "Your case '" + caze.getTitle() + "' has been received by " +
                    (caze.getVeterinarian() != null ? "veterinarian" : "CAHW");
            notificationService.createNotification(
                    caze.getFarmer().getId(),
                    "Case Received",
                    message,
                    "SUCCESS"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify farmer about case received: " + e.getMessage());
        }
        
        return convertToDTO(updatedCase);
    }

    // Mark case as completed with diagnosis and treatment
    @Transactional
    public CaseDTO markCaseAsCompleted(Long caseId, CaseDTO caseDTO) {
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        
        caze.setStatus(Case.CaseStatus.COMPLETED);
        caze.setDiagnosis(caseDTO.getDiagnosis());
        caze.setTreatment(caseDTO.getTreatment());
        caze.setResolution(caseDTO.getResolution());
        
        Case updatedCase = caseRepository.save(caze);
        
        // Notify farmer that case was completed
        try {
            String message = "Your case '" + caze.getTitle() + "' has been completed. " +
                    "Diagnosis: " + caze.getDiagnosis() + ". " +
                    "Treatment: " + caze.getTreatment();
            notificationService.createNotification(
                    caze.getFarmer().getId(),
                    "Case Completed",
                    message,
                    "SUCCESS"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify farmer about case completion: " + e.getMessage());
        }
        
        return convertToDTO(updatedCase);
    }

    // Escalate case to veterinarians in the same sector/location
    @Transactional
    public CaseDTO escalateCaseToVeterinarians(Long caseId, String escalationReason) {
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        
        // Only CAHW can escalate cases
        // This will be validated in the controller
        
        // Mark case as escalated
        caze.setIsEscalated(true);
        caze.setEscalatedAt(java.time.LocalDateTime.now());
        caze.setEscalationReason(escalationReason);
        
        Case updatedCase = caseRepository.save(caze);
        
        // Find all veterinarians in the same location/sector
        Location caseLocation = caze.getLocation();
        List<User> veterinariansInSector = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && 
                            u.getRole() == User.UserRole.VETERINARIAN && 
                            u.getLocation() != null && 
                            u.getLocation().getId().equals(caseLocation.getId()))
                .collect(Collectors.toList());
        
        // Notify all veterinarians in the sector
        for (User vet : veterinariansInSector) {
            try {
                String message = "Case '" + caze.getTitle() + "' has been escalated by CAHW " + 
                        (caze.getCahw() != null ? caze.getCahw().getName() : "Unknown") + 
                        ". Reason: " + escalationReason;
                notificationService.createNotification(
                        vet.getId(),
                        "Case Escalated - Action Required",
                        message,
                        "ALERT"
                );
            } catch (Exception e) {
                System.err.println("Failed to notify veterinarian: " + e.getMessage());
            }
        }
        
        // Notify farmer about escalation
        try {
            String message = "Your case '" + caze.getTitle() + "' has been escalated to veterinarians for expert consultation.";
            notificationService.createNotification(
                    caze.getFarmer().getId(),
                    "Case Escalated",
                    message,
                    "INFO"
            );
        } catch (Exception e) {
            System.err.println("Failed to notify farmer about escalation: " + e.getMessage());
        }
        
        return convertToDTO(updatedCase);
    }
    

    private CaseDTO convertToDTO(Case caze) {
        // Convert media if present
        List<CaseMediaDTO> mediaList = null;
        if (caze.getMedia() != null && !caze.getMedia().isEmpty()) {
            mediaList = caze.getMedia().stream().map(media -> 
                CaseMediaDTO.builder()
                    .id(media.getId())
                    .caseId(media.getCaze().getId())
                    .mediaType(media.getMediaType().toString())
                    .fileUrl(media.getFileUrl())
                    .fileName(media.getFileName())
                    .description(media.getDescription())
                    .fileSizeBytes(media.getFileSizeBytes())
                    .uploadedAt(media.getUploadedAt())
                    .uploadedByUserId(media.getUploadedByUserId())
                    .build()
            ).collect(Collectors.toList());
        }

        return CaseDTO.builder()
                .id(caze.getId())
                .farmerId(caze.getFarmer() != null ? caze.getFarmer().getId() : null)
                .animalId(caze.getAnimal() != null ? caze.getAnimal().getId() : null)
                .veterinarianId(caze.getVeterinarian() != null ? caze.getVeterinarian().getId() : null)
                .cahwId(caze.getCahw() != null ? caze.getCahw().getId() : null)
                .locationId(caze.getLocation() != null ? caze.getLocation().getId() : null)
                .title(caze.getTitle())
                .description(caze.getDescription())
                .caseType(caze.getCaseType())
                .status(caze.getStatus().toString())
                .severity(caze.getSeverity())
                .diagnosis(caze.getDiagnosis())
                .treatment(caze.getTreatment())
                .resolution(caze.getResolution())
                .createdAt(caze.getCreatedAt())
                .updatedAt(caze.getUpdatedAt())
                .resolvedAt(caze.getResolvedAt())
                .isEscalated(caze.getIsEscalated())
                .escalatedAt(caze.getEscalatedAt())
                .escalationReason(caze.getEscalationReason())
                .media(mediaList)
                .build();
    }
}

