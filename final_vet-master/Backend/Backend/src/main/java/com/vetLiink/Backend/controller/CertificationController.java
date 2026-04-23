package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.CertificationDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.CertificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CertificationController {
    private final CertificationService certificationService;

    @PostMapping
    public ResponseEntity<?> createCertification(@RequestBody CertificationDTO certificationDTO) {
        try {
            CertificationDTO newCert = certificationService.createCertification(certificationDTO);
            return ResponseEntity.status(201).body(newCert);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertificationById(@PathVariable Long id) {
        try {
            CertificationDTO cert = certificationService.getCertificationById(id);
            return ResponseEntity.ok(cert);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCertificationsByUserId(@PathVariable Long userId) {
        try {
            List<CertificationDTO> certs = certificationService.getCertificationsByUserId(userId);
            return ResponseEntity.ok(certs);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getActiveCertifications(@PathVariable Long userId) {
        try {
            List<CertificationDTO> certs = certificationService.getActiveCertifications(userId);
            return ResponseEntity.ok(certs);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCertification(@PathVariable Long id, @RequestBody CertificationDTO certificationDTO) {
        try {
            CertificationDTO updated = certificationService.updateCertification(id, certificationDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCertification(@PathVariable Long id) {
        try {
            certificationService.deleteCertification(id);
            return ResponseEntity.ok("Certification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Certification not found");
        }
    }
}
