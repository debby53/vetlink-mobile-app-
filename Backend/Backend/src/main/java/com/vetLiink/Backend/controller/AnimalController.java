package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.AnimalDTO;
import com.vetLiink.Backend.dto.ErrorResponse;
import com.vetLiink.Backend.service.AnimalService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animals")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AnimalController {
    private final AnimalService animalService;

    @PostMapping
    public ResponseEntity<?> createAnimal(@RequestBody AnimalDTO animalDTO) {
        try {
            AnimalDTO newAnimal = animalService.createAnimal(animalDTO);
            return ResponseEntity.status(201).body(newAnimal);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnimalById(@PathVariable Long id) {
        try {
            AnimalDTO animal = animalService.getAnimalById(id);
            return ResponseEntity.ok(animal);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ErrorResponse.builder().message(e.getMessage()).status(404).build());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getAnimalsByFarmerId(@PathVariable Long farmerId) {
        try {
            List<AnimalDTO> animals = animalService.getAnimalsByFarmerId(farmerId);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnimal(@PathVariable Long id, @RequestBody AnimalDTO animalDTO) {
        try {
            AnimalDTO updatedAnimal = animalService.updateAnimal(id, animalDTO);
            return ResponseEntity.ok(updatedAnimal);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ErrorResponse.builder().message(e.getMessage()).status(400).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAnimal(@PathVariable Long id) {
        try {
            animalService.deleteAnimal(id);
            return ResponseEntity.ok("Animal deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Animal not found");
        }
    }
}
