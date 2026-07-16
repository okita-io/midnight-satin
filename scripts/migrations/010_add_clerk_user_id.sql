-- Link Neon readers to Clerk identities.
-- password_hash becomes optional once auth is fully Clerk-backed.

ALTER TABLE readers
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_readers_clerk_user_id ON readers(clerk_user_id);

ALTER TABLE readers
  ALTER COLUMN password_hash DROP NOT NULL;
