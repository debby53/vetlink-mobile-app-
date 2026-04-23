package com.vetLiink.Backend.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vetLiink.Backend.entity.Training;
import com.vetLiink.Backend.repository.TrainingRepository;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private TrainingRepository trainingRepository;
    
    @Autowired
    private com.vetLiink.Backend.repository.LessonRepository lessonRepository;

    public VideoController() {
        System.out.println("✅✅✅ VideoController initialized ✅✅✅");
    }

    /**
     * Stream video with HTTP Range request support (206 Partial Content)
     * Supports both Lesson ID, Training ID lookup and direct filename lookup
     * 
     * Endpoint: GET /api/videos/{idOrFilename}
     * Examples:
     *   GET /api/videos/lesson/105 -> fetch Lesson ID 105
     *   GET /api/videos/7 -> fetch Training ID 7 (legacy)
     *   GET /api/videos/1768486202811_video.mp4 -> fetch filename from filesystem
     */
    @GetMapping("/{idOrFilename}")
    public void getVideo(
            @PathVariable String idOrFilename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            HttpServletResponse response) {
        try {
            System.out.println("📹 Video request for: " + idOrFilename + ", Range: " + rangeHeader);
            File videoFile = null;
            
            // 1. Try to parse as specific "lesson-{id}" format or just numeric ID
            Long numericId = null;
            boolean isLessonExplicit = false;
            
            if (idOrFilename.startsWith("lesson-")) {
                try {
                    numericId = Long.parseLong(idOrFilename.substring(7));
                    isLessonExplicit = true;
                } catch (NumberFormatException e) { /* ignore */ }
            } else {
                 try {
                    numericId = Long.parseLong(idOrFilename);
                } catch (NumberFormatException e) { /* ignore */ }
            }
            
            // 2. Lookup logic
            if (numericId != null) {
                // Priority A: Check Lesson if explicitly requested OR just check it first
                try {
                    com.vetLiink.Backend.entity.Lesson lesson = lessonRepository.findByIdWithTraining(numericId).orElse(null);
                    
                    if (lesson != null) {
                         System.out.println("   Found Lesson: " + lesson.getTitle());
                         String videoUrl = lesson.getVideoUrl();
                         if (videoUrl != null && !videoUrl.isEmpty()) {
                             System.out.println("   Lesson has video URL: " + videoUrl);
                             String filename = extractFilename(videoUrl);
                             if (filename != null) {
                                 videoFile = getVideoFileFromFilesystem(filename);
                             }
                         } else {
                             System.out.println("   ⚠️ Lesson has no video URL, trying to find training video");
                             // Try to get the training this lesson belongs to and use its video
                             try {
                                 Training training = lesson.getTraining();
                                 if (training != null) {
                                     System.out.println("   Found training: " + training.getTitle());
                                     String trainingVideoUrl = training.getVideoUrl();
                                     if (trainingVideoUrl != null && !trainingVideoUrl.isEmpty()) {
                                         System.out.println("   Training has video URL: " + trainingVideoUrl);
                                         String filename = extractFilename(trainingVideoUrl);
                                         if (filename != null) {
                                             videoFile = getVideoFileFromFilesystem(filename);
                                         }
                                     } else {
                                         System.out.println("   ⚠️ Training also has no video URL");
                                     }
                                 } else {
                                     System.out.println("   ⚠️ Lesson has no training");
                                 }
                             } catch (Exception ex) {
                                 System.err.println("   ⚠️ Error accessing training video: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                             }
                         }
                    } else {
                        System.out.println("   ⚠️ Lesson not found with ID: " + numericId);
                    }
                } catch (Exception ex) {
                    System.err.println("   ⚠️ Error loading lesson: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                    ex.printStackTrace();
                }
                
                // Priority B: Check Training (Legacy fallback)
                if (videoFile == null && !isLessonExplicit) {
                     try {
                         Training training = trainingRepository.findById(numericId).orElse(null);
                         if (training != null) {
                             System.out.println("   Found Training: " + training.getTitle());
                             String videoUrl = training.getVideoUrl();
                             if (videoUrl != null && !videoUrl.isEmpty()) {
                                 String filename = extractFilename(videoUrl);
                                 videoFile = getVideoFileFromFilesystem(filename);
                             }
                         }
                     } catch (Exception ex) {
                         System.err.println("   ⚠️ Error loading training: " + ex.getMessage());
                     }
                }
            }
            
            // If training ID lookup failed or ID wasn't numeric, try as filename
            if (videoFile == null) {
                System.out.println("   Attempting to load as filename: " + idOrFilename);
                videoFile = getVideoFileFromFilesystem(idOrFilename);
                if (videoFile != null) {
                    System.out.println("   ✅ Found video file from filesystem (" + videoFile.length() + " bytes)");
                }
            }

            if (videoFile == null || !videoFile.exists()) {
                System.out.println("❌ No video file found for: " + idOrFilename);
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Video not found");
                return;
            }

            long contentLength = videoFile.length();
            System.out.println("   File size: " + contentLength + " bytes");

            // Verify file is readable - do this BEFORE setting any headers
            if (!videoFile.canRead()) {
                System.err.println("❌ Video file is not readable: " + videoFile.getAbsolutePath());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Video file is not readable\"}");
                return;
            }

            // Set common headers BEFORE any response writing
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Accept-Encoding");
            response.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
            response.setHeader("Cache-Control", "public, max-age=3600");
            response.setHeader("Content-Disposition", "inline; filename=\"video.mp4\"");
            // Audio-specific headers for proper codec support
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("X-Frame-Options", "SAMEORIGIN");
            response.setContentType("video/mp4");

            // Parse Range header if provided
            if (rangeHeader != null && !rangeHeader.isEmpty()) {
                handleRangeRequest(videoFile, rangeHeader, contentLength, response);
            } else {
                // Serve full video
                serveFullVideo(videoFile, contentLength, response);
            }

        } catch (Exception e) {
            System.err.println("❌ Error serving video: " + e.getMessage());
            System.err.println("   Exception type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            // Try to send error, but don't fail if response is already committed
            try {
                if (!response.isCommitted()) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Error serving video\"}");
                }
            } catch (IOException ioe) {
                System.err.println("❌ Error sending error response: " + ioe.getMessage());
            }
        }
    }

    /**
     * Serve full video file with 200 OK response
     * Writes directly to the servlet response
     */
    private void serveFullVideo(File videoFile, long contentLength, HttpServletResponse response) {
        try {
            System.out.println("   Serving full video: " + videoFile.getName());
            
            response.setStatus(HttpServletResponse.SC_OK);
            // Set Content-Length header properly for large files
            response.setHeader("Content-Length", String.valueOf(contentLength));
            // Ensure proper content type for video/audio streaming
            response.setContentType("video/mp4");
            response.setHeader("Accept-Ranges", "bytes");
            
            try (FileInputStream fis = new FileInputStream(videoFile);
                 OutputStream out = response.getOutputStream()) {
                
                byte[] buffer = new byte[65536]; // 64KB buffer for better audio/video streaming
                int bytesRead;
                long bytesSent = 0;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    bytesSent += bytesRead;
                }
                out.flush();
                System.out.println("✅ Full video served (200 OK) - " + bytesSent + " bytes sent");
            }
                    
        } catch (IOException e) {
            System.err.println("❌ Error serving video: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Handle HTTP Range requests (206 Partial Content)
     * This is essential for video scrubbing/seeking in HTML5 video player
     */
    private void handleRangeRequest(File videoFile, String rangeHeader, long contentLength, HttpServletResponse response) {
        try {
            System.out.println("   Processing range request: " + rangeHeader);

            if (!rangeHeader.startsWith("bytes=")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid range header\"}");
                return;
            }

            String rangeSpec = rangeHeader.substring(6);
            RangeInfo rangeInfo = parseRangeHeader(rangeSpec, contentLength);

            if (rangeInfo == null || !rangeInfo.isValid()) {
                response.setHeader("Content-Range", "bytes */" + contentLength);
                response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
                return;
            }

            long rangeLength = rangeInfo.end - rangeInfo.start + 1;
            System.out.println("   Range: bytes " + rangeInfo.start + "-" + rangeInfo.end + "/" + contentLength);

            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
            response.setHeader("Content-Range", String.format("bytes %d-%d/%d", rangeInfo.start, rangeInfo.end, contentLength));
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Content-Length", String.valueOf(rangeLength));
            response.setContentType("video/mp4");

            try (InputStream in = new RangeInputStream(videoFile, rangeInfo.start, rangeLength);
                 OutputStream out = response.getOutputStream()) {

                byte[] buffer = new byte[65536]; // 64KB buffer for better streaming
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                out.flush();
            }

            System.out.println("✅ Range served (206 Partial Content) - " + rangeLength + " bytes");

        } catch (IOException e) {
            System.err.println("❌ Error handling range request: " + e.getMessage());
            e.printStackTrace();
            // Don't try to send error if response is already committed
            if (!response.isCommitted()) {
                try { 
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Error processing range request\"}");
                } catch (IOException ex) { /* ignore */ }
            }
        }
    }

    /**
     * Build standard video response headers
     */
    private HttpHeaders buildVideoHeaders(long contentLength) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("video/mp4"));
        headers.setContentLength(contentLength);
        headers.set("Cache-Control", "public, max-age=3600");
        headers.set("Content-Disposition", "inline; filename=\"video.mp4\"");
        
        // CORS headers - essential for HTML5 video element
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Range, Accept-Encoding");
        headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        
        return headers;
    }

    /**
     * Parse Range header and extract start/end bytes
     * Handles: "0-1023", "1024-", "-512"
     */
    private RangeInfo parseRangeHeader(String rangeSpec, long contentLength) {
        try {
            RangeInfo info = new RangeInfo();
            
            if (rangeSpec.startsWith("-")) {
                // Suffix range: "-512" means last 512 bytes
                long suffixLength = Long.parseLong(rangeSpec.substring(1));
                info.start = Math.max(0, contentLength - suffixLength);
                info.end = contentLength - 1;
            } else if (rangeSpec.endsWith("-")) {
                // Open-ended range: "1024-" means from 1024 to end
                info.start = Long.parseLong(rangeSpec.substring(0, rangeSpec.length() - 1));
                info.end = contentLength - 1;
            } else {
                // Closed range: "0-1023"
                String[] parts = rangeSpec.split("-", 2);
                info.start = Long.parseLong(parts[0]);
                info.end = Long.parseLong(parts[1]);
            }
            
            info.contentLength = contentLength;
            return info;
        } catch (Exception e) {
            System.err.println("❌ Invalid range format: " + rangeSpec);
            return null;
        }
    }

    /**
     * Read a range of bytes from file using RandomAccessFile
     */
    private byte[] readRangeFromFile(File file, long start, long length) {
        try {
            byte[] buffer = new byte[(int) length];
            
            try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
                raf.seek(start);
                raf.readFully(buffer);
            }
            
            return buffer;
        } catch (IOException e) {
            System.err.println("❌ Error reading range from file: " + e.getMessage());
            return null;
        }
    }

    /**
     * Custom InputStream for streaming a specific range from a file
     * Avoids loading entire file into memory
     */
    private static class RangeInputStream extends InputStream {
        private RandomAccessFile raf;
        private long remaining;
        private boolean closed = false;

        public RangeInputStream(File file, long start, long length) throws IOException {
            this.raf = new RandomAccessFile(file, "r");
            this.raf.seek(start);
            this.remaining = length;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0 || closed) {
                return -1;
            }
            int b = raf.read();
            if (b >= 0) {
                remaining--;
            }
            return b;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (remaining <= 0 || closed) {
                return -1;
            }
            int toRead = Math.min(len, (int) Math.min(remaining, Integer.MAX_VALUE));
            int n = raf.read(b, off, toRead);
            if (n > 0) {
                remaining -= n;
            }
            return n;
        }

        @Override
        public void close() throws IOException {
            if (!closed) {
                closed = true;
                raf.close();
            }
        }
    }

    /**
     * Simple POJO for range information
     */
    private static class RangeInfo {
        long start;
        long end;
        long contentLength;
        
        boolean isValid() {
            return start >= 0 && start <= end && end < contentLength;
        }
    }

    /**
     * Handle OPTIONS requests for CORS preflight
     */
    @RequestMapping(method = RequestMethod.OPTIONS, value = "/{idOrFilename}")
    public ResponseEntity<?> handleOptions(@PathVariable String idOrFilename) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Range, Accept-Encoding");
        headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        headers.set("Access-Control-Max-Age", "3600");
        
        System.out.println("✅ OPTIONS preflight request for: " + idOrFilename);
        return ResponseEntity.ok().headers(headers).build();
    }

    /**
     * Handle HEAD requests (used by browsers to check video availability)
     */
    @RequestMapping(method = RequestMethod.HEAD, value = "/{idOrFilename}")
    public ResponseEntity<?> headVideo(
            @PathVariable String idOrFilename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
        try {
            System.out.println("📹 HEAD request for: " + idOrFilename);
            File videoFile = locateVideoFile(idOrFilename);
            
            if (videoFile == null || !videoFile.exists() || !videoFile.canRead()) {
                return ResponseEntity.notFound().build();
            }
            
            long contentLength = videoFile.length();
            HttpHeaders headers = buildVideoHeaders(contentLength);
            headers.set("Accept-Ranges", "bytes");
            
            System.out.println("✅ HEAD response - " + contentLength + " bytes");
            return ResponseEntity.ok().headers(headers).build();
            
        } catch (Exception e) {
            System.err.println("❌ HEAD request error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Locate video file by ID or filename
     */
    private File locateVideoFile(String idOrFilename) {
        File videoFile = null;
        Long numericId = null;
        boolean isLessonExplicit = false;
        
        // Try parsing as numeric ID
        if (idOrFilename.startsWith("lesson-")) {
            try {
                numericId = Long.parseLong(idOrFilename.substring(7));
                isLessonExplicit = true;
            } catch (NumberFormatException e) { /* ignore */ }
        } else {
            try {
                numericId = Long.parseLong(idOrFilename);
            } catch (NumberFormatException e) { /* ignore */ }
        }
        
        // Lookup lesson by ID
        if (numericId != null) {
            try {
                var lesson = lessonRepository.findByIdWithTraining(numericId).orElse(null);
                if (lesson != null && lesson.getVideoUrl() != null) {
                    String filename = extractFilename(lesson.getVideoUrl());
                    videoFile = getVideoFileFromFilesystem(filename);
                    if (videoFile != null) return videoFile;
                }
                
                // Try training ID as fallback
                if (!isLessonExplicit) {
                    var training = trainingRepository.findById(numericId).orElse(null);
                    if (training != null && training.getVideoUrl() != null) {
                        String filename = extractFilename(training.getVideoUrl());
                        videoFile = getVideoFileFromFilesystem(filename);
                        if (videoFile != null) return videoFile;
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error looking up by ID: " + e.getMessage());
            }
        }
        
        // Try direct filename lookup
        videoFile = getVideoFileFromFilesystem(idOrFilename);
        return videoFile;
    }

    /**
     * Load video file from filesystem (fallback method)
     */
    private File getVideoFileFromFilesystem(String filename) {
        // Security: prevent directory traversal
        if (filename == null || filename.isEmpty()) {
            System.out.println("❌ Filename is null or empty");
            return null;
        }
        
        if (filename.contains("..")) {
            System.out.println("❌ Invalid filename (directory traversal attempt): " + filename);
            return null;
        }

        // Try multiple possible upload directories
        String[] possiblePaths = {
            System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "videos",
            System.getProperty("user.home") + File.separator + "uploads" + File.separator + "videos",
            "uploads" + File.separator + "videos"
        };

        for (String uploadsPath : possiblePaths) {
            Path videoPath = Paths.get(uploadsPath, filename);
            File videoFile = videoPath.toFile();

            System.out.println("   Trying path: " + videoPath.toAbsolutePath());
            
            if (videoFile.exists() && videoFile.isFile()) {
                System.out.println("✅ Found exact file: " + filename + " at " + videoPath.toAbsolutePath());
                return videoFile;
            }
        }

        // If exact file not found, try to find the most recent video file with a similar name pattern
        System.out.println("⚠️ Exact file not found for: " + filename);
        System.out.println("   Looking for alternative files...");
        
        try {
            String uploadsPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "videos";
            File uploadsDir = new File(uploadsPath);
            
            if (!uploadsDir.isDirectory()) {
                System.out.println("❌ Videos directory does not exist: " + uploadsPath);
                System.out.println("   Trying alternate directory...");
                uploadsPath = System.getProperty("user.home") + File.separator + "uploads" + File.separator + "videos";
                uploadsDir = new File(uploadsPath);
                if (!uploadsDir.isDirectory()) {
                    System.out.println("❌ Alternate directory also does not exist: " + uploadsPath);
                    return null;
                }
            }
            
            System.out.println("   Scanning directory: " + uploadsDir.getAbsolutePath());
            File[] files = uploadsDir.listFiles((dir, name) -> name.endsWith(".mp4"));
            
            if (files == null || files.length == 0) {
                System.out.println("❌ No MP4 files found in directory: " + uploadsDir.getAbsolutePath());
                return null;
            }
            
            // Sort by last modified time (most recent first)
            java.util.Arrays.sort(files, (f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));
            
            System.out.println("   Found " + files.length + " MP4 files in directory");
            for (int i = 0; i < Math.min(5, files.length); i++) {
                System.out.println("     " + (i+1) + ". " + files[i].getName() + " (" + files[i].length() + " bytes)");
            }
            
            // Check if any file has a similar name (same pattern, different timestamp)
            String fileNamePattern = filename.replaceAll("\\d+_", "");
            for (File f : files) {
                String fname = f.getName().replaceAll("\\d+_", "");
                if (fname.equals(fileNamePattern)) {
                    System.out.println("✅ Found file with matching pattern: " + f.getName());
                    return f;
                }
            }
            
            // If no pattern match, return the most recent file
            System.out.println("✅ Using most recent file: " + files[0].getName());
            return files[0];
            
        } catch (Exception e) {
            System.err.println("❌ Error searching for alternative files: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private String extractFilename(String videoUrl) {
        if (videoUrl == null || videoUrl.isEmpty()) {
            System.out.println("⚠️ extractFilename called with null or empty videoUrl");
            return null;
        }
        if (videoUrl.contains("/")) {
            return videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
        }
        return videoUrl;
    }
}
