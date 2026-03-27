-- Migration: Add paperback_orders for physical fulfillment (buy-paperback spec, Req 7.1)
-- Run on existing databases. New installs from a fresh schema.sql already include this table.

CREATE TABLE IF NOT EXISTS paperback_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  shipping_name TEXT,
  shipping_address JSONB,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paperback_orders_reader ON paperback_orders(reader_id);
CREATE INDEX IF NOT EXISTS idx_paperback_orders_novel ON paperback_orders(novel_id);
CREATE INDEX IF NOT EXISTS idx_paperback_orders_session ON paperback_orders(stripe_session_id);
