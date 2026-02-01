package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.entity.ELocationType;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.service.LocationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {
    private final LocationService locationService;

    // Get all locations by type
    @GetMapping("/by-type")
    public ResponseEntity<List<Location>> getLocationsByType(@RequestParam String type) {
        ELocationType locationType = ELocationType.valueOf(type.toUpperCase());
        return ResponseEntity.ok(locationService.getLocationsByType(locationType));
    }

    // Get child locations by parent
    @GetMapping("/children")
    public ResponseEntity<List<Location>> getChildLocations(@RequestParam Long parentId) {
        Location parent = locationService.getLocationById(parentId);
        if (parent == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(locationService.getChildLocationsByParent(parent));
    }

    // Get location by name
    @GetMapping("/by-name")
    public ResponseEntity<Location> getLocationByName(@RequestParam String name) {
        return locationService.getLocationByName(name)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get location by ID
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        Location location = locationService.getLocationById(id);
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(location);
    }

    // Get all locations
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    // Get location hierarchy (supports both query param and path variable)
    @GetMapping("/hierarchy")
    public ResponseEntity<String> getLocationHierarchy(@RequestParam(name = "locationId", required = false) Long locationId,
                                                       @RequestParam(name = "cellId", required = false) Long cellId) {
        Long id = locationId != null ? locationId : cellId;
        if (id == null) return ResponseEntity.badRequest().build();
        Location location = locationService.getLocationById(id);
        if (location == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(locationService.getLocationHierarchy(location));
    }

    @GetMapping("/hierarchy/{cellId}")
    public ResponseEntity<String> getLocationHierarchyPath(@PathVariable Long cellId) {
        Location location = locationService.getLocationById(cellId);
        if (location == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(locationService.getLocationHierarchy(location));
    }

    // Get provinces
    @GetMapping("/provinces")
    public ResponseEntity<List<Location>> getProvinces() {
        return ResponseEntity.ok(locationService.getLocationsByType(ELocationType.PROVINCE));
    }

    // Get districts by province
    @GetMapping("/districts")
    public ResponseEntity<List<Location>> getDistrictsByProvince(@RequestParam(required = false) Long provinceId) {
        if (provinceId != null) {
            Location province = locationService.getLocationById(provinceId);
            if (province == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(locationService.getChildLocationsByParent(province));
        }
        // compatibility path: /districts/province/{id}
        return ResponseEntity.ok(locationService.getLocationsByType(ELocationType.DISTRICT));
    }

    // Compatibility endpoint used by frontend: /districts/province/{provinceId}
    @GetMapping("/districts/province/{provinceId}")
    public ResponseEntity<List<Location>> getDistrictsByProvincePath(@PathVariable Long provinceId) {
        Location province = locationService.getLocationById(provinceId);
        if (province == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(locationService.getChildLocationsByParent(province));
    }

    // Get sectors by district
    @GetMapping("/sectors")
    public ResponseEntity<List<Location>> getSectorsByDistrict(@RequestParam(required = false) Long districtId) {
        if (districtId != null) {
            Location district = locationService.getLocationById(districtId);
            if (district == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(locationService.getChildLocationsByParent(district));
        }
        return ResponseEntity.ok(locationService.getLocationsByType(ELocationType.SECTOR));
    }

    @GetMapping("/sectors/district/{districtId}")
    public ResponseEntity<List<Location>> getSectorsByDistrictPath(@PathVariable Long districtId) {
        Location district = locationService.getLocationById(districtId);
        if (district == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(locationService.getChildLocationsByParent(district));
    }
}
