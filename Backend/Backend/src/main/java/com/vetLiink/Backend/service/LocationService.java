package com.vetLiink.Backend.service;

import com.vetLiink.Backend.entity.ELocationType;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    public List<Location> getLocationsByType(ELocationType type) {
        return locationRepository.findByTypeOrderByName(type);
    }

    public List<Location> getChildLocationsByParent(Location parentLocation) {
        return locationRepository.findByParentLocationId(parentLocation.getId());
    }

    public Optional<Location> getLocationByName(String name) {
        return locationRepository.findByName(name);
    }

    public Optional<Location> getLocationByCode(String code) {
        return locationRepository.findByCode(code);
    }

    public Location createLocation(ELocationType type, String name, String code, Location parentLocation) {
        Location location = new Location(type, name, code, parentLocation, name);
        return locationRepository.save(location);
    }

    public Location createLocation(ELocationType type, String name, String code, Location parentLocation, String displayName) {
        Location location = new Location(type, name, code, parentLocation, displayName);
        return locationRepository.save(location);
    }

    public String getLocationHierarchy(Location location) {
        if (location == null) return "";

        StringBuilder hierarchy = new StringBuilder();
        Location current = location;

        while (current != null) {
            if (hierarchy.length() > 0) {
                hierarchy.insert(0, " > ");
            }
            hierarchy.insert(0, current.getDisplayName());
            current = current.getParentLocation();
        }

        return hierarchy.toString();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id).orElse(null);
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
}

