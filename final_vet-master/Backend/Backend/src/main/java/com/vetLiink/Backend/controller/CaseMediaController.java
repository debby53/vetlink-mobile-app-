package com.vetLiink.Backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vetLiink.Backend.dto.CaseMediaDTO;
import com.vetLiink.Backend.service.CaseMediaService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cases/{caseId}/media")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CaseMediaController {
    private final CaseMediaService caseMediaService;

    @PostMapping("/upload")
    public ResponseEntity<CaseMediaDTO> uploadMedia(
            @PathVariable Long caseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("userId") Long userId) {
        try {
            CaseMediaDTO media = caseMediaService.uploadMedia(caseId, file, description, userId);
            return ResponseEntity.status(201).body(media);
        } catch (IOException e) {
            return ResponseEntity.status(400).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<CaseMediaDTO>> getMediaByCase(
            @PathVariable Long caseId,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            // If userId is not provided, don't perform access check
            List<CaseMediaDTO> mediaList = caseMediaService.getMediaByCase(caseId, userId);
            return ResponseEntity.ok(mediaList);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<String> deleteMedia(
            @PathVariable Long caseId,
            @PathVariable Long mediaId,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            caseMediaService.deleteMedia(mediaId, userId);
            return ResponseEntity.ok("Media deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to delete media");
        }
    }
}
