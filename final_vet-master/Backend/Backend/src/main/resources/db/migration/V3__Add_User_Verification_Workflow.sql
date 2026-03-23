-- V3__Add_User_Verification_Workflow.sql
-- Adds user verification and activation workflow for CAHWs and veterinarians

-- Create UserStatus enum type
CREATE TYPE user_status AS ENUM ('PENDING_VERIFICATION', 'TRAINING_REQUIRED', 'ACTIVE', 'SUSPENDED');

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'PENDING_VERIFICATION' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sector VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_vet_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Update veterinarians table
ALTER TABLE veterinarians ADD COLUMN IF NOT EXISTS sector VARCHAR(255);
ALTER TABLE veterinarians ADD COLUMN IF NOT EXISTS license_verification_document VARCHAR(500);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_sector ON users(sector);
CREATE INDEX IF NOT EXISTS idx_users_assigned_vet ON users(assigned_vet_id);

-- Set existing active users to PENDING_VERIFICATION (they need verification)
-- ADMIN users remain ACTIVE for backward compatibility
UPDATE users SET status = 'ACTIVE' WHERE role = 'ADMIN';
UPDATE users SET status = 'PENDING_VERIFICATION' WHERE role IN ('CAHW', 'VETERINARIAN', 'FARMER');
