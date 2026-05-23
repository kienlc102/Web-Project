-- Migration: Add Account Lockout columns
-- Date: 2026-05-23

ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN locked_until DATETIME NULL;

-- Add index for locked_until to optimize lockout checks
CREATE INDEX idx_users_locked_until ON users(locked_until);
