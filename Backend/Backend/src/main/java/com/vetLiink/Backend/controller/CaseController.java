package com.vetLiink.Backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.dto.CaseDTO;
import com.vetLiink.Backend.service.CaseService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cases")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CaseController {
    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<CaseDTO> createCase(@RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO newCase = caseService.createCase(caseDTO);
            return ResponseEntity.status(201).body(newCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getAllCases() {
        return ResponseEntity.ok(caseService.getAllCases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable Long id) {
        try {
            System.out.println("Fetching case with ID: " + id);
            CaseDTO caze = caseService.getCaseById(id);
            System.out.println("Case found: " + caze);
            return ResponseEntity.ok(caze);
        } catch (Exception e) {
            System.err.println("Error fetching case: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<CaseDTO>> getCasesByFarmerId(@PathVariable Long farmerId) {
        List<CaseDTO> cases = caseService.getCasesByFarmerId(farmerId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/veterinarian/{veterinarianId}")
    public ResponseEntity<List<CaseDTO>> getCasesByVeterinarianId(@PathVariable Long veterinarianId) {
        List<CaseDTO> cases = caseService.getCasesByVeterinarianId(veterinarianId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/cahw/{cahwId}")
    public ResponseEntity<List<CaseDTO>> getCasesByCAHWId(@PathVariable Long cahwId) {
        List<CaseDTO> cases = caseService.getCasesByCAHWId(cahwId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/location/{locationId}/available")
    public ResponseEntity<List<CaseDTO>> getAvailableCasesByLocation(@PathVariable Long locationId) {
        try {
            List<CaseDTO> cases = caseService.getAvailableCasesByLocation(locationId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/escalated")
    public ResponseEntity<List<CaseDTO>> getEscalatedCases() {
        try {
            List<CaseDTO> cases = caseService.getEscalatedCases();
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/veterinarian/{veterinarianId}/sector")
    public ResponseEntity<List<CaseDTO>> getCasesByVeterinarianLocation(@PathVariable Long veterinarianId) {
        try {
            List<CaseDTO> cases = caseService.getCasesByVeterinarianLocation(veterinarianId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/cahw/{cahwId}/sector")
    public ResponseEntity<List<CaseDTO>> getCasesByCAHWLocation(@PathVariable Long cahwId) {
        try {
            List<CaseDTO> cases = caseService.getCasesByCAHWLocation(cahwId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/assign-cahw/{cahwId}")
    public ResponseEntity<CaseDTO> assignToCAHW(@PathVariable Long id, @PathVariable Long cahwId) {
        try {
            CaseDTO updatedCase = caseService.assignToCAHW(id, cahwId);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/assign/{veterinarianId}")
    public ResponseEntity<CaseDTO> assignToVeterinarian(@PathVariable Long id, @PathVariable Long veterinarianId) {
        try {
            CaseDTO updatedCase = caseService.assignToVeterinarian(id, veterinarianId);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(@PathVariable Long id, @RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO updatedCase = caseService.updateCase(id, caseDTO);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/mark-received")
    public ResponseEntity<CaseDTO> markCaseAsReceived(@PathVariable Long id) {
        try {
            CaseDTO updatedCase = caseService.markCaseAsReceived(id);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/mark-completed")
    public ResponseEntity<CaseDTO> markCaseAsCompleted(@PathVariable Long id, @RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO updatedCase = caseService.markCaseAsCompleted(id, caseDTO);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<CaseDTO> escalateCase(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String escalationReason = request.get("escalationReason");
            if (escalationReason == null || escalationReason.trim().isEmpty()) {
                return ResponseEntity.status(400).body(null);
            }
            CaseDTO updatedCase = caseService.escalateCaseToVeterinarians(id, escalationReason);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCase(@PathVariable Long id) {
        try {
            caseService.deleteCase(id);
            return ResponseEntity.ok("Case deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Case not found");
        }
    }
}
