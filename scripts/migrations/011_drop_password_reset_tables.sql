-- Migration 011: Drop legacy password-reset tables (Clerk cutover)
-- Safe after password-reset server code is removed. Keep readers.password_hash
-- until inventory confirms no password-only accounts remain, then drop in a later migration.

DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS password_reset_log;
