package com.vetLiink.Backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.vetLiink.Backend.dto.CaseMediaDTO;
import com.vetLiink.Backend.entity.Case;
import com.vetLiink.Backend.entity.CaseMedia;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.CaseMediaRepository;
import com.vetLiink.Backend.repository.CaseRepository;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaseMediaService {
    private final CaseMediaRepository caseMediaRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList("video/mp4", "video/quicktime", "video/x-msvideo", "video/webm");

    @Transactional
    public CaseMediaDTO uploadMedia(Long caseId, MultipartFile file, String description, Long userId) throws IOException {
        // Validate file
        validateFile(file);

        // Check case exists
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        // Check user owns the case (farmer) or is assigned to it
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateAccessToCase(caze, user);

        // Determine media type
        CaseMedia.MediaType mediaType = determineMediaType(file.getContentType());

        // Save file to disk
        String fileUrl = saveFileToDisk(file, caseId);

        // Create media record
        CaseMedia media = CaseMedia.builder()
                .caze(caze)
                .mediaType(mediaType)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .description(description)
                .fileSizeBytes(file.getSize())
                .uploadedByUserId(userId)
                .build();

        CaseMedia savedMedia = caseMediaRepository.save(media);
        return convertToDTO(savedMedia);
    }

    @Transactional(readOnly = true)
    public List<CaseMediaDTO> getMediaByCase(Long caseId, Long userId) {
        // Check case exists
        Case caze = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        // If userId is provided, validate access
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            validateAccessToCase(caze, user);
        }
        // If userId is null, return media without access check

        // Get all media for case
        List<CaseMedia> mediaList = caseMediaRepository.findByCazeId(caseId);
        return mediaList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteMedia(Long mediaId, Long userId) {
        CaseMedia media = caseMediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        // Check access if userId is provided
        if (userId != null) {
            Case caze = media.getCaze();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            validateAccessToCase(caze, user);
        }

        // Delete file from disk
        try {
            Files.deleteIfExists(Paths.get(media.getFileUrl()));
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        // Delete from database
        caseMediaRepository.deleteById(mediaId);
    }

    @Transactional
    public void deleteMediaByCase(Long caseId) {
        List<CaseMedia> mediaList = caseMediaRepository.findByCazeId(caseId);
        for (CaseMedia media : mediaList) {
            try {
                Files.deleteIfExists(Paths.get(media.getFileUrl()));
            } catch (IOException e) {
                System.err.println("Failed to delete file: " + e.getMessage());
            }
        }
        caseMediaRepository.deleteByCazeId(caseId);
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 100MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new RuntimeException("File type cannot be determined");
        }

        if (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_VIDEO_TYPES.contains(contentType)) {
            throw new RuntimeException("Unsupported file type: " + contentType);
        }
    }

    private CaseMedia.MediaType determineMediaType(String contentType) {
        if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
            return CaseMedia.MediaType.VIDEO;
        }
        return CaseMedia.MediaType.IMAGE;
    }

    private String saveFileToDisk(MultipartFile file, Long caseId) throws IOException {
        // Create directory structure
        Path uploadDir = Paths.get(uploadPath, "case-" + caseId);
        Files.createDirectories(uploadDir);

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(filename);

        // Save file
        Files.write(filePath, file.getBytes());

        // Return URL instead of file path
        // URL format: /api/case-media/{caseId}/{filename}
        return "/api/case-media/" + caseId + "/" + filename;
    }

    private void validateAccessToCase(Case caze, User user) {
        // Farmer (case owner) can always access
        if (caze.getFarmer().getId().equals(user.getId())) {
            return;
        }

        // Assigned CAHW can access
        if (caze.getCahw() != null && caze.getCahw().getId().equals(user.getId())) {
            return;
        }

        // Assigned veterinarian can access
        if (caze.getVeterinarian() != null && caze.getVeterinarian().getId().equals(user.getId())) {
            return;
        }

        throw new RuntimeException("User does not have access to this case");
    }

    private CaseMediaDTO convertToDTO(CaseMedia media) {
        return CaseMediaDTO.builder()
                .id(media.getId())
                .caseId(media.getCaze().getId())
                .mediaType(media.getMediaType().toString())
                .fileUrl(media.getFileUrl())
                .fileName(media.getFileName())
                .description(media.getDescription())
                .fileSizeBytes(media.getFileSizeBytes())
                .uploadedAt(media.getUploadedAt())
                .uploadedByUserId(media.getUploadedByUserId())
                .build();
    }
}
