package com.vetLiink.Backend.util;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility class to handle video audio processing using FFmpeg
 * This will add audio streams to video files that are missing audio
 */
public class VideoAudioUtil {
    
    // Try to use full path first, fallback to system PATH
    private static final String FFMPEG_COMMAND = getFFmpegPath();
    private static final String FFPROBE_COMMAND = getFFprobePath();
    private static final long AUDIO_DETECTION_TIMEOUT = 10000; // 10 seconds
    private static final long ENCODING_TIMEOUT = 600000; // 10 minutes for large files
    
    private static String getFFmpegPath() {
        String[] possiblePaths = {
            "C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe",
            "C:\\ffmpeg\\ffmpeg\\bin\\ffmpeg.exe",
            "ffmpeg"
        };
        for (String path : possiblePaths) {
            File f = new File(path);
            if (f.exists()) return path;
        }
        return "ffmpeg";
    }
    
    private static String getFFprobePath() {
        String[] possiblePaths = {
            "C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffprobe.exe",
            "C:\\ffmpeg\\ffmpeg\\bin\\ffprobe.exe",
            "ffprobe"
        };
        for (String path : possiblePaths) {
            File f = new File(path);
            if (f.exists()) return path;
        }
        return "ffprobe";
    }
    
    /**
     * Check if FFmpeg is available on the system
     */
    public static boolean isFFmpegAvailable() {
        try {
            ProcessBuilder pb = new ProcessBuilder(FFMPEG_COMMAND, "-version");
            pb.redirectErrorStream(true);
            Process p = pb.start();
            int result = p.waitFor();
            return result == 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if a video file has audio tracks
     */
    public static boolean hasAudioTrack(String videoFilePath) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                FFPROBE_COMMAND,
                "-v", "error",
                "-select_streams", "a:0",
                "-show_entries", "stream=codec_type",
                "-of", "default=noprint_wrappers=1:nokey=1",
                videoFilePath
            );
            pb.redirectErrorStream(true);
            Process p = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line = reader.readLine();
            boolean hasAudio = line != null && line.contains("audio");
            
            boolean finished = p.waitFor(AUDIO_DETECTION_TIMEOUT, java.util.concurrent.TimeUnit.MILLISECONDS);
            if (!finished) {
                p.destroyForcibly();
            }
            
            return hasAudio;
        } catch (Exception e) {
            System.err.println("⚠️ Error checking audio: " + e.getMessage());
            return false; // Assume no audio on error
        }
    }
    
    /**
     * Add silent audio to a video file using FFmpeg
     * Creates a new file with audio and replaces the original
     */
    public static boolean addSilentAudio(String videoFilePath) {
        if (!isFFmpegAvailable()) {
            System.err.println("❌ FFmpeg not available - cannot add audio");
            return false;
        }
        
        try {
            File originalFile = new File(videoFilePath);
            if (!originalFile.exists()) {
                System.err.println("❌ Video file not found: " + videoFilePath);
                return false;
            }
            
            // Check if already has audio
            if (hasAudioTrack(videoFilePath)) {
                System.out.println("✅ Video already has audio track");
                return true;
            }
            
            System.out.println("🎵 Adding silent audio to video: " + originalFile.getName());
            
            // Create temp file
            String tempPath = videoFilePath + ".tmp";
            
            // FFmpeg command to add silent audio
            List<String> command = new ArrayList<>();
            command.add(FFMPEG_COMMAND);
            command.add("-i");
            command.add(videoFilePath);
            command.add("-f");
            command.add("lavfi");
            command.add("-i");
            command.add("anullsrc=r=44100:cl=stereo");
            command.add("-c:v");
            command.add("copy");           // Copy video codec as-is (faster)
            command.add("-c:a");
            command.add("aac");            // Use AAC audio codec
            command.add("-shortest");      // Match audio to video length
            command.add("-y");             // Overwrite temp file
            command.add(tempPath);
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            
            // Log FFmpeg output
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("error") || line.contains("Error")) {
                    System.err.println("   FFmpeg: " + line);
                }
            }
            
            boolean finished = p.waitFor(ENCODING_TIMEOUT, java.util.concurrent.TimeUnit.MILLISECONDS);
            if (!finished) {
                p.destroyForcibly();
                System.err.println("❌ FFmpeg timed out");
                new File(tempPath).delete();
                return false;
            }
            
            int exitCode = p.exitValue();
            if (exitCode != 0) {
                System.err.println("❌ FFmpeg failed with exit code: " + exitCode);
                new File(tempPath).delete();
                return false;
            }
            
            // Replace original with temp
            File tempFile = new File(tempPath);
            if (tempFile.exists()) {
                originalFile.delete();
                tempFile.renameTo(originalFile);
                System.out.println("✅ Audio successfully added to video");
                return true;
            } else {
                System.err.println("❌ FFmpeg did not create output file");
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error adding audio: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Get detailed information about a video file
     */
    public static String getVideoInfo(String videoFilePath) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                FFPROBE_COMMAND,
                "-v", "error",
                "-show_format",
                "-show_streams",
                videoFilePath
            );
            pb.redirectErrorStream(true);
            Process p = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            p.waitFor(AUDIO_DETECTION_TIMEOUT, java.util.concurrent.TimeUnit.MILLISECONDS);
            return output.toString();
        } catch (Exception e) {
            return "Error getting video info: " + e.getMessage();
        }
    }
}
