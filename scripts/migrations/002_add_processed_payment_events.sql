-- Migration: Add processed_payment_events for idempotent webhook handling (Req 8.4)
-- Run this on existing databases. New installs use schema.sql which includes this table.

CREATE TABLE IF NOT EXISTS processed_payment_events (
  stripe_event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
