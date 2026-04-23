package com.vetLiink.Backend.config;

import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadsPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
        String fileUri = "file:///" + uploadsPath.replace("\\", "/");
        // Serve files under /uploads/** from the filesystem uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileUri)
                .setCachePeriod(3600);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins(parseAllowedOrigins())
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
        
        registry.addMapping("/api/videos/**")
                .allowedOrigins(parseAllowedOrigins())
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Length", "Content-Range", "Accept-Ranges")
                .allowCredentials(false)
                .maxAge(3600);

        registry.addMapping("/api/case-media/**")
                .allowedOrigins(parseAllowedOrigins())
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Length", "Content-Range", "Accept-Ranges")
                .allowCredentials(false)
                .maxAge(3600);
    }

    private String[] parseAllowedOrigins() {
        return java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }
}
