-- Migration: Add granular password reset logging event types (THE-135)
-- Requirements: 7.1, 7.2, 7.3
-- Adds: reset_requested, token_generated, email_sent, token_validated,
--       token_invalid, token_expired, token_used, rate_limited

ALTER TABLE password_reset_log DROP CONSTRAINT IF EXISTS password_reset_log_event_type_check;
ALTER TABLE password_reset_log ADD CONSTRAINT password_reset_log_event_type_check CHECK (event_type IN (
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
));
