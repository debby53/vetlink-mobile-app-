package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.service.FeedAdvisoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feed-advisory")
@CrossOrigin(origins = "*") // Adjust for production
public class ForageController {

    @Autowired
    private FeedAdvisoryService feedAdvisoryService;

    // --- Ration Calculator Endpoints ---

    @PostMapping("/calculate")
    public ResponseEntity<FeedAdvisoryService.RationRecommendation> calculateRation(
            @RequestBody FeedAdvisoryService.AnimalProfile profile) {
        FeedAdvisoryService.RationRecommendation result = feedAdvisoryService.calculateRation(profile);
        return ResponseEntity.ok(result);
    }

    // --- Forage Catalog Endpoints (Example) ---
    // Assuming a Repository exists or returning dummy data for the example request

    @GetMapping("/forage-catalog")
    public ResponseEntity<List<Map<String, Object>>> getForageCatalog(
            @RequestParam(required = false) String type) {
        
        // Mock data response based on User Story 2
        Map<String, Object> brachiaria = Map.of(
            "id", 1,
            "name", "Brachiaria Grass (Mulato II)",
            "description", "Drought tolerant, high protein grass suitable for dairy cows.",
            "plantingSeason", "September - November",
            "maturityDays", 90,
            "supplierContacts", "AgroInput Rwamagana: +250788000000"
        );

        Map<String, Object> desmodium = Map.of(
            "id", 2,
            "name", "Desmodium",
            "description", "Legume providing high protein, fixes nitrogen in soil.",
            "plantingSeason", "September - October",
            "maturityDays", 120,
            "supplierContacts", "Kigali Seeds: +250788111111"
        );

        return ResponseEntity.ok(List.of(brachiaria, desmodium));
    }

    // --- Content Management (Extension Officer) ---

    @PostMapping("/content/upload")
    public ResponseEntity<String> uploadContent(@RequestBody Map<String, String> contentPayload) {
        // In a real app, this would save to the 'education_content' table
        String title = contentPayload.get("title");
        String url = contentPayload.get("url");
        
        return ResponseEntity.ok("Content '" + title + "' uploaded successfully via URL: " + url);
    }
}
