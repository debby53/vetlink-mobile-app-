package com.vetLiink.Backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path root = Paths.get(System.getProperty("user.dir"), "uploads", "videos");

    public FileStorageService() throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
    }

    public String store(MultipartFile file) {
        try {
            String original = file.getOriginalFilename();
            String safe = System.currentTimeMillis() + "_" + (original == null ? "file" : original.replaceAll("\\s+", "_"));
            Path target = root.resolve(safe).normalize().toAbsolutePath();
            // copy stream to avoid partial writes
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // We return an API-accessible path for the frontend to request the video via a controller
            return "/api/videos/" + safe;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
