package com.vetLiink.Backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer {
    private final EntityManager entityManager;

    @EventListener(ContextRefreshedEvent.class)
    public void initializeDatabase() {
        try {
            log.info("🔧 Updating notifications constraint...");
            
            // Drop the old constraint
            entityManager.createNativeQuery(
                "ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check"
            ).executeUpdate();
            
            // Add the new constraint with CALL type
            entityManager.createNativeQuery(
                "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('ALERT', 'INFO', 'SUCCESS', 'WARNING', 'CALL'))"
            ).executeUpdate();
            
            log.info("✅ Constraint updated successfully!");
        } catch (Exception e) {
            log.error("⚠️ Warning during constraint update: " + e.getMessage());
        }
    }
}
