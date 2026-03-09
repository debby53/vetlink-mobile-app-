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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.dto.CaseDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.CaseService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cases")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CaseController {
    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<?> createCase(@RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO newCase = caseService.createCase(caseDTO);
            return ResponseEntity.status(201).body(newCase);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getAllCases() {
        return ResponseEntity.ok(caseService.getAllCases());
    }

    @GetMapping("/stats/trends")
    public ResponseEntity<List<Map<String, Object>>> getCaseTrends() {
        return ResponseEntity.ok(caseService.getCaseTrends());
    }

    @GetMapping("/stats/types")
    public ResponseEntity<List<Map<String, Object>>> getCaseTypeDistribution() {
        return ResponseEntity.ok(caseService.getCaseTypeDistribution());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(@PathVariable Long id) {
        try {
            System.out.println("Fetching case with ID: " + id);
            CaseDTO caze = caseService.getCaseById(id);
            System.out.println("Case found: " + caze);
            return ResponseEntity.ok(caze);
        } catch (Exception e) {
            System.err.println("Error fetching case: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
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
    public ResponseEntity<?> getAvailableCasesByLocation(@PathVariable Long locationId) {
        try {
            List<CaseDTO> cases = caseService.getAvailableCasesByLocation(locationId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/escalated")
    public ResponseEntity<?> getEscalatedCases() {
        try {
            List<CaseDTO> cases = caseService.getEscalatedCases();
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/veterinarian/{veterinarianId}/sector")
    public ResponseEntity<?> getCasesByVeterinarianLocation(@PathVariable Long veterinarianId) {
        try {
            List<CaseDTO> cases = caseService.getCasesByVeterinarianLocation(veterinarianId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/cahw/{cahwId}/sector")
    public ResponseEntity<?> getCasesByCAHWLocation(@PathVariable Long cahwId) {
        try {
            List<CaseDTO> cases = caseService.getCasesByCAHWLocation(cahwId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/assign-cahw/{cahwId}")
    public ResponseEntity<?> assignToCAHW(@PathVariable Long id, @PathVariable Long cahwId) {
        try {
            CaseDTO updatedCase = caseService.assignToCAHW(id, cahwId);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/assign/{veterinarianId}")
    public ResponseEntity<?> assignToVeterinarian(@PathVariable Long id, @PathVariable Long veterinarianId) {
        try {
            CaseDTO updatedCase = caseService.assignToVeterinarian(id, veterinarianId);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO updatedCase = caseService.updateCase(id, caseDTO);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/mark-received")
    public ResponseEntity<?> markCaseAsReceived(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        try {
            CaseDTO updatedCase = caseService.markCaseAsReceived(id, userId);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/mark-completed")
    public ResponseEntity<?> markCaseAsCompleted(@PathVariable Long id, @RequestBody CaseDTO caseDTO) {
        try {
            CaseDTO updatedCase = caseService.markCaseAsCompleted(id, caseDTO);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<?> escalateCase(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String escalationReason = request.get("escalationReason");
            if (escalationReason == null || escalationReason.trim().isEmpty()) {
                return ResponseEntity.status(400).body(ErrorResponse.builder().message("Escalation reason is required").status(400).build());
            }
            CaseDTO updatedCase = caseService.escalateCaseToVeterinarians(id, escalationReason);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
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
