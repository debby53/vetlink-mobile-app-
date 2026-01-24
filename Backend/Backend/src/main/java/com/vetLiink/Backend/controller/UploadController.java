package com.vetLiink.Backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    @PostMapping("/video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String uploadsRoot = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "videos" + File.separator;
            Path uploadPath = Paths.get(uploadsRoot);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String safeName = System.currentTimeMillis() + "_" + (originalFilename != null ? originalFilename.replaceAll("\\s+", "_") : "video.mp4");
            Path target = uploadPath.resolve(safeName);
            Files.copy(file.getInputStream(), target);

            System.out.println("✅ Video uploaded: " + target.toAbsolutePath());
            System.out.println("   File size: " + target.toFile().length() + " bytes");

            Map<String, String> resp = new HashMap<>();
            // Return URL via new VideoController endpoint instead of static resource
            resp.put("videoUrl", "/api/videos/" + safeName);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            System.err.println("❌ Upload failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to upload file");
            return ResponseEntity.status(500).body(err);
        }
    }
}
