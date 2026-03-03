-- Migration: Add featured columns for admin curation (Req 1.10)
-- Run this on existing databases that were created before this migration.
-- New installs use schema.sql which already includes these columns.

ALTER TABLE novels ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE novels ADD COLUMN IF NOT EXISTS featured_order INT;
