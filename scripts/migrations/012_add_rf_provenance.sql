-- Migration: RF→MS provenance join keys (MS-1 / romance-architecture)
-- New generations only — existing novels/chapters stay NULL.
-- Run manually against Neon before importing RF bundles that emit provenance/.

ALTER TABLE novels ADD COLUMN IF NOT EXISTS rf_story_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS novels_rf_story_id_uidx
  ON novels (rf_story_id)
  WHERE rf_story_id IS NOT NULL;

-- Per-chapter act provenance from RF provenance/chapter_NN.json
-- Shape: { provenance_version, coordinate_space, rubric_version, acts: [...] }
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS rf_provenance JSONB;
