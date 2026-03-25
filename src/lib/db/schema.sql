-- Midnight Satin Database Schema
-- Vercel Postgres - per design document

CREATE TABLE author_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  biography TEXT,
  style_tags TEXT[] DEFAULT '{}',
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES author_profiles(id) ON DELETE CASCADE,
  description TEXT,
  genre_tags TEXT[] DEFAULT '{}',
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES author_profiles(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  synopsis TEXT,
  genre_tags TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  publication_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(novel_id, chapter_number)
);

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_subtitle TEXT,
  portrait_url TEXT,
  description TEXT,
  backstory TEXT,
  stats JSONB DEFAULT '{}',
  secrets TEXT[] DEFAULT '{}',
  endorsement_count INT DEFAULT 0,
  has_trophy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE readers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  credit_balance INT DEFAULT 0,
  role TEXT DEFAULT 'reader',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

CREATE TABLE password_reset_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'request_sent',
    'link_used',
    'link_expired',
    'invalid_token',
    'rate_limit',
    'password_changed',
    'email_failed',
    'reset_requested',
    'token_generated',
    'email_sent',
    'token_validated',
    'token_invalid',
    'token_expired',
    'token_used',
    'rate_limited'
  )),
  reader_id UUID REFERENCES readers(id) ON DELETE SET NULL,
  ip_address TEXT,
  reason_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reading_progress (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  scroll_percent DECIMAL(5,2) DEFAULT 0.00,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, chapter_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'chapter_unlock', 'endorsement', 'welcome_bonus', 'admin_adjustment')),
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chapter_unlocks (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, chapter_id)
);

CREATE TABLE author_follows (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES author_profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, author_id)
);

CREATE TABLE reader_bookmarks (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, novel_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 800),
  like_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comment_likes (
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (reader_id, comment_id)
);

-- Indexes for common queries
CREATE INDEX idx_novels_author ON novels(author_id);
CREATE INDEX idx_novels_series ON novels(series_id);
CREATE INDEX idx_chapters_novel ON chapters(novel_id);
CREATE INDEX idx_characters_novel ON characters(novel_id);
CREATE INDEX idx_reading_progress_reader ON reading_progress(reader_id);
CREATE INDEX idx_credit_transactions_reader ON credit_transactions(reader_id);
CREATE INDEX idx_chapter_unlocks_reader ON chapter_unlocks(reader_id);
CREATE INDEX idx_author_follows_reader ON author_follows(reader_id);
CREATE INDEX idx_reader_bookmarks_reader ON reader_bookmarks(reader_id);
CREATE INDEX idx_readers_email ON readers(email);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_reader_id ON password_reset_tokens(reader_id);
CREATE INDEX idx_password_reset_tokens_created_at ON password_reset_tokens(created_at);
CREATE INDEX idx_password_reset_log_created_at ON password_reset_log(created_at);
CREATE INDEX idx_password_reset_log_reader_id ON password_reset_log(reader_id);
CREATE INDEX idx_comments_chapter ON comments(chapter_id, created_at DESC);
CREATE INDEX idx_comments_reader ON comments(reader_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);

-- Idempotency for payment webhooks (Req 8.4)
CREATE TABLE processed_payment_events (
  stripe_event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles (news-updates-system spec)
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  article_type TEXT NOT NULL CHECK (article_type IN ('editorial', 'campaign', 'ranking', 'popularity', 'announcement')),
  hero_image_url TEXT,
  summary TEXT NOT NULL,
  body_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  attribution TEXT NOT NULL,
  source_url TEXT,
  source_platform TEXT CHECK (source_platform IS NULL OR source_platform IN ('tiktok', 'instagram', 'x', 'youtube', 'facebook')),
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_type ON news_articles(article_type);
CREATE INDEX idx_news_articles_featured ON news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
