-- Migration: Add email_failed event type to password_reset_log (THE-119)
-- Requirements: 3.6, 7.1, 7.3
-- Allows logging Resend/email delivery failures.

ALTER TABLE password_reset_log DROP CONSTRAINT IF EXISTS password_reset_log_event_type_check;
ALTER TABLE password_reset_log ADD CONSTRAINT password_reset_log_event_type_check CHECK (event_type IN (
  'request_sent',
  'link_used',
  'link_expired',
  'invalid_token',
  'rate_limit',
  'password_changed',
  'email_failed'
));
