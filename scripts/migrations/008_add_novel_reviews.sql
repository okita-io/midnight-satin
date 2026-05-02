-- Novel reviews (one per reader per novel) + helpful likes for sorting / future UI

CREATE TABLE IF NOT EXISTS novel_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  like_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (novel_id, reader_id)
);

CREATE TABLE IF NOT EXISTS review_likes (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES novel_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, review_id)
);

CREATE INDEX IF NOT EXISTS idx_novel_reviews_novel ON novel_reviews(novel_id, like_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_novel_reviews_reader ON novel_reviews(reader_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);
