-- Migration: Add Email field to users table
-- Date: 2026-06-14

-- Add email column (UNIQUE, NOT NULL)
ALTER TABLE users 
ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL AFTER username;

-- Add index for email lookups (faster queries)
CREATE INDEX idx_users_email ON users(email);

-- Note: Existing records will need email values
-- Run this BEFORE running migration if you have existing users:
-- UPDATE users SET email = CONCAT(username, '@temp.local') WHERE email IS NULL;
