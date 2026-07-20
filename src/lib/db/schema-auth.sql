-- Minimal schema for authentication (Task 2). Full schema in design.md.
-- Run this to enable auth; Task 1.2 adds the full schema.

CREATE TABLE IF NOT EXISTS readers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  credit_balance INT DEFAULT 0,
  role TEXT DEFAULT 'reader',
  clerk_user_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'chapter_unlock', 'endorsement', 'welcome_bonus', 'admin_adjustment')),
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readers_email ON readers(email);
CREATE INDEX IF NOT EXISTS idx_readers_clerk_user_id ON readers(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reader ON credit_transactions(reader_id);
