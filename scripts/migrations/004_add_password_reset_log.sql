-- Migration: Add password_reset_log table for email password reset security logging (THE-99)
-- Requirements: 7.1, 7.2, 7.3
-- Run this on existing databases. New installs use schema.sql which includes this table.

CREATE TABLE IF NOT EXISTS password_reset_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'request_sent',
    'link_used',
    'link_expired',
    'invalid_token',
    'rate_limit',
    'password_changed'
  )),
  reader_id UUID REFERENCES readers(id) ON DELETE SET NULL,
  ip_address TEXT,
  reason_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_log_created_at ON password_reset_log(created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_log_reader_id ON password_reset_log(reader_id);
