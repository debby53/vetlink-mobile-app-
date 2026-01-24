-- Add CALL to notifications_type_check constraint
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('ALERT', 'INFO', 'SUCCESS', 'WARNING', 'CALL'));
