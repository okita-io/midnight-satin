-- Per-review star rating (1–5) for aggregates on novel cover (upgrade from 008).

ALTER TABLE novel_reviews
  ADD COLUMN IF NOT EXISTS star_rating INT DEFAULT 5;

UPDATE novel_reviews SET star_rating = 5 WHERE star_rating IS NULL;

ALTER TABLE novel_reviews
  ALTER COLUMN star_rating SET NOT NULL;

ALTER TABLE novel_reviews
  DROP CONSTRAINT IF EXISTS novel_reviews_star_rating_check;

ALTER TABLE novel_reviews
  ADD CONSTRAINT novel_reviews_star_rating_check
  CHECK (star_rating >= 1 AND star_rating <= 5);
