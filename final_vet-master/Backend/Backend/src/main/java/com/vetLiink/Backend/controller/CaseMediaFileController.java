package com.vetLiink.Backend.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;

import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/case-media")
@CrossOrigin(origins = "*")
public class CaseMediaFileController {

    /**
     * Serve case media files (videos and images) with HTTP Range request support
     * Endpoint: GET /api/case-media/{caseId}/{filename}
     * Example: GET /api/case-media/1/uuid-video.mp4
     * Note: Filename can contain spaces and special characters (URL encoded)
     */
    @GetMapping("/{caseId}/{filename:.+}")
    public void getCaseMedia(
            @PathVariable Long caseId,
            @PathVariable String filename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            HttpServletResponse response) {
        try {
            // Decode the filename (handles URL-encoded spaces and special characters)
            String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);
            System.out.println("📹 Case media request - Case: " + caseId + ", File: " + decodedFilename);

            // Try multiple possible paths (for backward compatibility)
            File mediaFile = null;
            
            // Try new path first: uploads/case-{caseId}/{filename}
            File newPath = Paths.get("uploads", "case-" + caseId, decodedFilename).toFile();
            System.out.println("   Trying new path: " + newPath.getAbsolutePath());
            if (newPath.exists() && newPath.canRead()) {
                mediaFile = newPath;
                System.out.println("   ✅ Found at new path");
            }
            
            // Try old path: uploads/case-media/case-{caseId}/{filename}
            if (mediaFile == null) {
                File oldPath = Paths.get("uploads", "case-media", "case-" + caseId, decodedFilename).toFile();
                System.out.println("   Trying old path: " + oldPath.getAbsolutePath());
                if (oldPath.exists() && oldPath.canRead()) {
                    mediaFile = oldPath;
                    System.out.println("   ✅ Found at old path");
                }
            }
            
            // Check if file was found
            if (mediaFile == null || !mediaFile.exists() || !mediaFile.canRead()) {
                System.err.println("❌ Case media file not found at any location for case: " + caseId + ", file: " + filename);
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Media file not found");
                return;
            }
            
            if (!mediaFile.canRead()) {
                System.err.println("❌ Case media file not readable: " + mediaFile.getAbsolutePath());
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Cannot read media file");
                return;
            }

            // Verify the file is within the uploads directory (prevent directory traversal)
            try {
                String canonicalPath = mediaFile.getCanonicalPath();
                String canonicalUploadPath = new File("uploads").getCanonicalPath();
                System.out.println("   Canonical path: " + canonicalPath);
                System.out.println("   Upload path: " + canonicalUploadPath);
                
                if (!canonicalPath.startsWith(canonicalUploadPath)) {
                    System.err.println("❌ Security violation - attempted access outside upload directory");
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
                    return;
                }
            } catch (IOException e) {
                System.err.println("⚠️ Error checking canonical paths: " + e.getMessage());
                // Continue anyway if canonical path check fails
            }

            long contentLength = mediaFile.length();
            System.out.println("   File size: " + contentLength + " bytes");

            // Determine content type based on filename
            String contentType = determineContentType(filename);
            
            // Set CORS headers
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Accept-Encoding");
            response.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
            
            // Set standard headers
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Cache-Control", "public, max-age=86400");
            response.setContentType(contentType);

            // Handle range requests for seeking in videos
            if (rangeHeader != null && !rangeHeader.isEmpty()) {
                handleRangeRequest(mediaFile, rangeHeader, contentLength, contentType, response);
            } else {
                // Serve full file
                serveFullFile(mediaFile, contentLength, contentType, response);
            }

        } catch (Exception e) {
            System.err.println("❌ Error serving case media: " + e.getMessage());
            e.printStackTrace();
            try {
                if (!response.isCommitted()) {
                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error serving media file");
                }
            } catch (IOException ioe) {
                System.err.println("❌ Error sending error response: " + ioe.getMessage());
            }
        }
    }

    /**
     * Serve the full file with 200 OK response
     */
    private void serveFullFile(File mediaFile, long contentLength, String contentType, 
                              HttpServletResponse response) throws IOException {
        System.out.println("   Serving full file: " + mediaFile.getName());
        
        response.setStatus(HttpServletResponse.SC_OK);
        response.setHeader("Content-Length", String.valueOf(contentLength));
        response.setContentType(contentType);

        try (FileInputStream fis = new FileInputStream(mediaFile);
             OutputStream out = response.getOutputStream()) {
            
            byte[] buffer = new byte[65536]; // 64KB buffer
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            out.flush();
        }
    }

    /**
     * Handle HTTP Range requests for seeking in media
     */
    private void handleRangeRequest(File mediaFile, String rangeHeader, long contentLength,
                                   String contentType, HttpServletResponse response) throws IOException {
        System.out.println("   Handling range request: " + rangeHeader);

        // Parse range header (e.g., "bytes=0-1023")
        String[] parts = rangeHeader.split("=");
        if (parts.length != 2) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            return;
        }

        String rangeSpec = parts[1];
        long start = 0;
        long end = contentLength - 1;

        if (rangeSpec.startsWith("-")) {
            // Suffix byte range
            long suffix = Long.parseLong(rangeSpec.substring(1));
            start = Math.max(0, contentLength - suffix);
        } else if (rangeSpec.contains("-")) {
            String[] range = rangeSpec.split("-");
            start = Long.parseLong(range[0]);
            if (range.length > 1 && !range[1].isEmpty()) {
                end = Long.parseLong(range[1]);
            }
        }

        if (start > end || start >= contentLength) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            response.setHeader("Content-Range", "bytes */" + contentLength);
            return;
        }

        long rangeLength = end - start + 1;

        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + contentLength);
        response.setHeader("Content-Length", String.valueOf(rangeLength));
        response.setContentType(contentType);

        try (RandomAccessFile raf = new RandomAccessFile(mediaFile, "r");
             OutputStream out = response.getOutputStream()) {
            
            raf.seek(start);
            byte[] buffer = new byte[65536];
            long remaining = rangeLength;
            int bytesRead;

            while (remaining > 0 && (bytesRead = raf.read(buffer, 0, (int)Math.min(buffer.length, remaining))) != -1) {
                out.write(buffer, 0, bytesRead);
                remaining -= bytesRead;
            }
            out.flush();
        }
    }

    /**
     * Determine content type based on file extension
     */
    private String determineContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".mp4")) {
            return "video/mp4";
        } else if (lowerFilename.endsWith(".webm")) {
            return "video/webm";
        } else if (lowerFilename.endsWith(".mov") || lowerFilename.endsWith(".quicktime")) {
            return "video/quicktime";
        } else if (lowerFilename.endsWith(".avi")) {
            return "video/x-msvideo";
        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        }
        
        return "application/octet-stream";
    }
}
