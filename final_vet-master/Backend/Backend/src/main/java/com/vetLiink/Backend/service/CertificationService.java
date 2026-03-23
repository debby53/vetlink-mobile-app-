package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.CertificationDTO;
import com.vetLiink.Backend.entity.Certification;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.entity.UserTraining;
import com.vetLiink.Backend.repository.CertificationRepository;
import com.vetLiink.Backend.repository.UserRepository;
import com.vetLiink.Backend.repository.UserTrainingRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CertificationService {
    private final CertificationRepository certificationRepository;
    private final UserRepository userRepository;
    private final UserTrainingRepository userTrainingRepository;

    /**
     * Automatically generate and save a certificate when a user completes all lessons of a training
     */
    @Transactional
    public Certification generateCertificateForCompletion(Long enrollmentId) {
        UserTraining enrollment = userTrainingRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Verify enrollment is actually complete
        if (enrollment.getStatus() != UserTraining.EnrollmentStatus.COMPLETED || 
            enrollment.getProgressPercentage() < 100.0) {
            throw new RuntimeException("Enrollment is not complete. Cannot issue certificate.");
        }

        User user = enrollment.getUser();
        String trainingTitle = enrollment.getTraining().getTitle();

        // Check if certificate already exists for this user and training
        List<Certification> existingCerts = certificationRepository.findByUserId(user.getId());
        for (Certification cert : existingCerts) {
            if (cert.getTitle().contains(trainingTitle) && cert.getIsActive()) {
                System.out.println("✅ Certificate already exists for user " + user.getId() + 
                                  " and training " + trainingTitle);
                return cert;
            }
        }

        // Create new certificate
        Certification certificate = Certification.builder()
                .user(user)
                .title("Certificate of Completion - " + trainingTitle)
                .issuedBy(enrollment.getTraining().getInstructor().getName())
                .description("This certifies that " + user.getName() + 
                            " has successfully completed the " + trainingTitle + 
                            " training course.")
                .issuedDate(LocalDateTime.now())
                .certificateUrl("/certificates/" + UUID.randomUUID().toString())
                .isActive(true)
                .build();

        Certification savedCertificate = certificationRepository.save(certificate);
        
        System.out.println("✅ Certificate generated for user " + user.getId() + 
                          " (ID: " + savedCertificate.getId() + ")");
        
        return savedCertificate;
    }

    public CertificationDTO createCertification(CertificationDTO certificationDTO) {
        User user = userRepository.findById(certificationDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Certification certification = Certification.builder()
                .user(user)
                .title(certificationDTO.getTitle())
                .issuedBy(certificationDTO.getIssuedBy())
                .description(certificationDTO.getDescription())
                .issuedDate(certificationDTO.getIssuedDate())
                .expiryDate(certificationDTO.getExpiryDate())
                .certificateUrl(certificationDTO.getCertificateUrl())
                .isActive(certificationDTO.getIsActive())
                .build();

        Certification savedCertification = certificationRepository.save(certification);
        return convertToDTO(savedCertification);
    }

    public List<CertificationDTO> getCertificationsByUserId(Long userId) {
        return certificationRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CertificationDTO> getActiveCertifications(Long userId) {
        return certificationRepository.findByUserIdAndIsActive(userId, true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CertificationDTO getCertificationById(Long id) {
        Certification certification = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
        return convertToDTO(certification);
    }

    public CertificationDTO updateCertification(Long id, CertificationDTO certificationDTO) {
        Certification certification = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        certification.setTitle(certificationDTO.getTitle());
        certification.setIssuedBy(certificationDTO.getIssuedBy());
        certification.setDescription(certificationDTO.getDescription());
        certification.setExpiryDate(certificationDTO.getExpiryDate());
        certification.setCertificateUrl(certificationDTO.getCertificateUrl());
        certification.setIsActive(certificationDTO.getIsActive());

        Certification updatedCertification = certificationRepository.save(certification);
        return convertToDTO(updatedCertification);
    }

    public void deleteCertification(Long id) {
        certificationRepository.deleteById(id);
    }

    private CertificationDTO convertToDTO(Certification certification) {
        return CertificationDTO.builder()
                .id(certification.getId())
                .userId(certification.getUser().getId())
                .title(certification.getTitle())
                .issuedBy(certification.getIssuedBy())
                .description(certification.getDescription())
                .issuedDate(certification.getIssuedDate())
                .expiryDate(certification.getExpiryDate())
                .certificateUrl(certification.getCertificateUrl())
                .isActive(certification.getIsActive())
                .build();
    }
}
