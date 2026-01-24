package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.VeterinarianDTO;
import com.vetLiink.Backend.service.VeterinarianService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarians")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class VeterinarianController {
    private final VeterinarianService veterinarianService;

    @PostMapping
    public ResponseEntity<VeterinarianDTO> createVeterinarian(@RequestBody VeterinarianDTO veterinarianDTO) {
        try {
            VeterinarianDTO created = veterinarianService.createVeterinarian(veterinarianDTO);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeterinarianDTO> getVeterinarianById(@PathVariable Long id) {
        try {
            VeterinarianDTO veterinarian = veterinarianService.getVeterinarianById(id);
            return ResponseEntity.ok(veterinarian);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<VeterinarianDTO> getVeterinarianByUserId(@PathVariable Long userId) {
        try {
            VeterinarianDTO veterinarian = veterinarianService.getVeterinarianByUserId(userId);
            return ResponseEntity.ok(veterinarian);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<VeterinarianDTO>> getAllVeterinarians() {
        try {
            List<VeterinarianDTO> veterinarians = veterinarianService.getAllVeterinarians();
            return ResponseEntity.ok(veterinarians);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<VeterinarianDTO>> getVeterinariansByLocation(@PathVariable Long locationId) {
        try {
            List<VeterinarianDTO> veterinarians = veterinarianService.getVeterinariansByLocation(locationId);
            return ResponseEntity.ok(veterinarians);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeterinarianDTO> updateVeterinarian(@PathVariable Long id, @RequestBody VeterinarianDTO veterinarianDTO) {
        try {
            VeterinarianDTO updated = veterinarianService.updateVeterinarian(id, veterinarianDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVeterinarian(@PathVariable Long id) {
        try {
            veterinarianService.deleteVeterinarian(id);
            return ResponseEntity.ok("Veterinarian deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Veterinarian not found");
        }
    }
}
