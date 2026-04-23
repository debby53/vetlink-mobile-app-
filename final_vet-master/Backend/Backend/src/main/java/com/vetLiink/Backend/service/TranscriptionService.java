package com.vetLiink.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@Service
public class TranscriptionService {

    @Value("${openai.api.key:}") // Allow empty for now
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public CompletableFuture<String> transcribeVideo(File videoFile) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            System.out.println("⚠️ OpenAI API Key is missing. Skipping transcription.");
            return CompletableFuture.completedFuture("Transcription disabled (Missing API Key)");
        }

        try {
            // Note: In a real prod environment, we should extract audio first using FFmpeg 
            // to reduce upload size (mp4 -> mp3) before sending to Whisper.
            // For MVP, we send the small video file directly if allowed, or assume it's small.
            // Whisper API limit is 25MB.
            
            String transcriptionUrl = "https://api.openai.com/v1/audio/transcriptions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(openAiApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(videoFile));
            body.add("model", "whisper-1");
            body.add("response_format", "text");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(transcriptionUrl, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return CompletableFuture.completedFuture(response.getBody());
            } else {
                System.err.println("❌ Whisper API Error: " + response.getStatusCode());
                return CompletableFuture.failedFuture(new RuntimeException("Whisper API failed"));
            }

        } catch (Exception e) {
            System.err.println("❌ Transcription failed: " + e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }
}
