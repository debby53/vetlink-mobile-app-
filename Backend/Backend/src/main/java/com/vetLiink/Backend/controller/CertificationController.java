package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.CertificationDTO;
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
    public ResponseEntity<CertificationDTO> createCertification(@RequestBody CertificationDTO certificationDTO) {
        try {
            CertificationDTO newCert = certificationService.createCertification(certificationDTO);
            return ResponseEntity.status(201).body(newCert);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificationDTO> getCertificationById(@PathVariable Long id) {
        try {
            CertificationDTO cert = certificationService.getCertificationById(id);
            return ResponseEntity.ok(cert);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CertificationDTO>> getCertificationsByUserId(@PathVariable Long userId) {
        try {
            List<CertificationDTO> certs = certificationService.getCertificationsByUserId(userId);
            return ResponseEntity.ok(certs);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<CertificationDTO>> getActiveCertifications(@PathVariable Long userId) {
        try {
            List<CertificationDTO> certs = certificationService.getActiveCertifications(userId);
            return ResponseEntity.ok(certs);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationDTO> updateCertification(@PathVariable Long id, @RequestBody CertificationDTO certificationDTO) {
        try {
            CertificationDTO updated = certificationService.updateCertification(id, certificationDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
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
