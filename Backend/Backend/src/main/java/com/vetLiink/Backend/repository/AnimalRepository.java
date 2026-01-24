package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {
    List<Animal> findByFarmerId(Long farmerId);
    List<Animal> findByType(String type);
}
