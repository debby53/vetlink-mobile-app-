package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.ELocationType;
import com.vetLiink.Backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByName(String name);
    Optional<Location> findByCode(String code);
    List<Location> findByType(ELocationType type);
    List<Location> findByTypeAndParentLocationId(ELocationType type, Long parentLocationId);
    List<Location> findByParentLocationId(Long parentLocationId);
    List<Location> findByTypeOrderByName(ELocationType type);
}
