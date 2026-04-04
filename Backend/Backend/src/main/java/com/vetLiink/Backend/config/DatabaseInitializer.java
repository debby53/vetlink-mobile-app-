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
    @org.springframework.transaction.annotation.Transactional
    public void initializeDatabase() {
        try {
            log.info("🔧 Updating notifications constraint...");
            
            // Drop the old constraint
            entityManager.createNativeQuery(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'notifications'
                    ) THEN
                        ALTER TABLE notifications
                            DROP CONSTRAINT IF EXISTS notifications_type_check;

                        ALTER TABLE notifications
                            ADD CONSTRAINT notifications_type_check
                            CHECK (type IN ('ALERT', 'INFO', 'SUCCESS', 'WARNING', 'CALL'));
                    END IF;
                END
                $$;
                """
            ).executeUpdate();
            
            log.info("✅ Constraint updated successfully!");
        } catch (Exception e) {
            log.error("⚠️ Warning during constraint update: " + e.getMessage());
        }
    }
}
