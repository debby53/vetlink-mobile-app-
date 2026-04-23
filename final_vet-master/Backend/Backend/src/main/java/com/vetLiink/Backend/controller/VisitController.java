package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.VisitDTO;
import com.vetLiink.Backend.service.VisitService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class VisitController {
    private final VisitService visitService;

    @PostMapping
    public ResponseEntity<VisitDTO> createVisit(@RequestBody VisitDTO visitDTO) {
        return ResponseEntity.ok(visitService.createVisit(visitDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitDTO> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }

    @GetMapping("/veterinarian/{veterinarianId}")
    public ResponseEntity<List<VisitDTO>> getVisitsByVeterinarianId(@PathVariable Long veterinarianId) {
        return ResponseEntity.ok(visitService.getVisitsByVeterinarianId(veterinarianId));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<VisitDTO>> getVisitsByFarmerId(@PathVariable Long farmerId) {
        return ResponseEntity.ok(visitService.getVisitsByFarmerId(farmerId));
    }

    @GetMapping("/veterinarian/{veterinarianId}/scheduled")
    public ResponseEntity<List<VisitDTO>> getScheduledVisitsByVeterinarianId(@PathVariable Long veterinarianId) {
        return ResponseEntity.ok(visitService.getScheduledVisitsByVeterinarianId(veterinarianId));
    }

    @GetMapping("/farmer/{farmerId}/scheduled")
    public ResponseEntity<List<VisitDTO>> getScheduledVisitsByFarmerId(@PathVariable Long farmerId) {
        return ResponseEntity.ok(visitService.getScheduledVisitsByFarmerId(farmerId));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<VisitDTO>> getVisitsByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(visitService.getVisitsByCase(caseId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitDTO> updateVisit(@PathVariable Long id, @RequestBody VisitDTO visitDTO) {
        return ResponseEntity.ok(visitService.updateVisit(id, visitDTO));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeVisit(@PathVariable Long id) {
        visitService.completeVisit(id, null);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelVisit(@PathVariable Long id) {
        visitService.cancelVisit(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        visitService.deleteVisit(id);
        return ResponseEntity.ok().build();
    }
}
