-- Migration script for Aeroview 360 database schema updates
-- Safe execution using IF NOT EXISTS for PostgreSQL / Neon DB

-- 1. Update sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- 2. Update videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_source VARCHAR(50) DEFAULT 'uploaded';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_360 BOOLEAN DEFAULT false;

-- 3. Update images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'image';
