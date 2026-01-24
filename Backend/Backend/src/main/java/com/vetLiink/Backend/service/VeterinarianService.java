package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.VeterinarianDTO;
import com.vetLiink.Backend.entity.Case;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.Veterinarian;
import com.vetLiink.Backend.repository.CaseRepository;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.repository.VeterinarianRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class VeterinarianService {
    private final VeterinarianRepository veterinarianRepository;
    private final UserRepository userRepository;
    private final CaseRepository caseRepository;

    public VeterinarianDTO createVeterinarian(VeterinarianDTO dto) {
        User user = userRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getRole().toString().equals("VETERINARIAN")) {
            throw new RuntimeException("User must have VETERINARIAN role");
        }

        Veterinarian veterinarian = Veterinarian.builder()
                .user(user)
                .phone(dto.getPhone())
                .specialization(dto.getSpecialization())
                .licenseNumber(dto.getLicenseNumber())
                .totalCasesResolved(0)
                .averageResponseTime(0.0)
                .build();

        Veterinarian saved = veterinarianRepository.save(veterinarian);
        return convertToDTO(saved);
    }

    public VeterinarianDTO getVeterinarianById(Long id) {
        Veterinarian veterinarian = veterinarianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        return convertToDTO(veterinarian);
    }

    public VeterinarianDTO getVeterinarianByUserId(Long userId) {
        Veterinarian veterinarian = veterinarianRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found for this user"));
        return convertToDTO(veterinarian);
    }

    public List<VeterinarianDTO> getAllVeterinarians() {
        return veterinarianRepository.findAllActive().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VeterinarianDTO> getVeterinariansByLocation(Long locationId) {
        return veterinarianRepository.findByLocationId(locationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public VeterinarianDTO updateVeterinarian(Long id, VeterinarianDTO dto) {
        Veterinarian veterinarian = veterinarianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        if (dto.getPhone() != null) {
            veterinarian.setPhone(dto.getPhone());
        }
        if (dto.getSpecialization() != null) {
            veterinarian.setSpecialization(dto.getSpecialization());
        }

        Veterinarian updated = veterinarianRepository.save(veterinarian);
        return convertToDTO(updated);
    }

    public void deleteVeterinarian(Long id) {
        Veterinarian veterinarian = veterinarianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
        veterinarianRepository.delete(veterinarian);
    }

    private VeterinarianDTO convertToDTO(Veterinarian veterinarian) {
        User user = veterinarian.getUser();
        
        // Count active cases
        List<Case> activeCases = caseRepository.findByVeterinarianId(user.getId()).stream()
                .filter(c -> !"resolved".equals(c.getStatus()))
                .collect(Collectors.toList());

        return VeterinarianDTO.builder()
                .id(veterinarian.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(veterinarian.getPhone())
                .specialization(veterinarian.getSpecialization())
                .licenseNumber(veterinarian.getLicenseNumber())
                .active(user.getActive())
                .locationId(user.getLocation() != null ? user.getLocation().getId() : null)
                .locationName(user.getLocation() != null ? user.getLocation().getDisplayName() : null)
                .activeCases(activeCases.size())
                .totalCasesResolved(veterinarian.getTotalCasesResolved() != null ? veterinarian.getTotalCasesResolved() : 0)
                .averageResponseTime(veterinarian.getAverageResponseTime())
                .registrationDate(veterinarian.getCreatedAt().toString())
                .build();
    }
}
