package com.vetLiink.Backend.service;

import com.vetLiink.Backend.dto.AnimalDTO;
import com.vetLiink.Backend.entity.Animal;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.AnimalRepository;
import com.vetLiink.Backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AnimalService {
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;

    public AnimalDTO createAnimal(AnimalDTO animalDTO) {
        User farmer = userRepository.findById(animalDTO.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Animal newAnimal = Animal.builder()
                .name(animalDTO.getName())
                .type(animalDTO.getType())
                .breed(animalDTO.getBreed())
                .age(animalDTO.getAge())
                .gender(animalDTO.getGender())
                .farmer(farmer)
                .healthStatus(animalDTO.getHealthStatus())
                .weight(animalDTO.getWeight())
                .specificAttributes(animalDTO.getSpecificAttributes())
                .build();

        Animal savedAnimal = animalRepository.save(newAnimal);
        return convertToDTO(savedAnimal);
    }

    public AnimalDTO getAnimalById(Long id) {
        Animal animal = animalRepository.findById(id).orElseThrow(() -> new RuntimeException("Animal not found"));
        return convertToDTO(animal);
    }

    public List<AnimalDTO> getAnimalsByFarmerId(Long farmerId) {
        return animalRepository.findByFarmerId(farmerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AnimalDTO updateAnimal(Long animalId, AnimalDTO animalDTO) {
        Animal animal = animalRepository.findById(animalId).orElseThrow(() -> new RuntimeException("Animal not found"));
        
        animal.setName(animalDTO.getName());
        animal.setType(animalDTO.getType());
        animal.setBreed(animalDTO.getBreed());
        animal.setAge(animalDTO.getAge());
        animal.setGender(animalDTO.getGender());
        animal.setHealthStatus(animalDTO.getHealthStatus());
        animal.setWeight(animalDTO.getWeight());
        animal.setSpecificAttributes(animalDTO.getSpecificAttributes());

        Animal updatedAnimal = animalRepository.save(animal);
        return convertToDTO(updatedAnimal);
    }

    public void deleteAnimal(Long animalId) {
        animalRepository.deleteById(animalId);
    }

    private AnimalDTO convertToDTO(Animal animal) {
        return AnimalDTO.builder()
                .id(animal.getId())
                .name(animal.getName())
                .type(animal.getType())
                .breed(animal.getBreed())
                .age(animal.getAge())
                .gender(animal.getGender())
                .farmerId(animal.getFarmer().getId())
                .healthStatus(animal.getHealthStatus())
                .weight(animal.getWeight())
                .specificAttributes(animal.getSpecificAttributes())
                .build();
    }
}
