/**
 * Midnight Satin Database Layer
 * Exports schema, types, and query helpers for Vercel Postgres
 */

import { sql } from "@vercel/postgres";
import type { ReaderDbRow } from "./types";
import { readerDbRowToReader } from "./types";

export { sql } from "@vercel/postgres";
export * from "./types";

/** Get reader by id (no password). Returns null if not found. */
export async function getReaderById(id: string) {
  const { rows } = await sql<ReaderDbRow>`SELECT id, email, password_hash, display_name, credit_balance, role, created_at, last_login_at FROM readers WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return readerDbRowToReader(rows[0]);
}

/** Get reader by email including password_hash for login. Returns null if not found. */
export async function getReaderByEmailWithPassword(email: string) {
  const { rows } = await sql<ReaderDbRow>`SELECT id, email, password_hash, display_name, credit_balance, role, created_at, last_login_at FROM readers WHERE LOWER(email) = LOWER(${email})`;
  if (rows.length === 0) return null;
  return rows[0];
}

/** Check if email is already registered. */
export async function readerExistsByEmail(email: string): Promise<boolean> {
  const { rows } = await sql<{ id: string }>`SELECT id FROM readers WHERE LOWER(email) = LOWER(${email})`;
  return rows.length > 0;
}

/** Look up a password reset token by hash. Returns reader_id, expires_at, used_at or null if not found. */
export async function getResetTokenByHash(
  tokenHash: string
): Promise<{ readerId: string; expiresAt: Date; usedAt: Date | null } | null> {
  const { rows } = await sql<{
    reader_id: string;
    expires_at: Date;
    used_at: Date | null;
  }>`SELECT reader_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ${tokenHash}`;
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    readerId: row.reader_id,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  };
}

/** Store a hashed reset token. Requirements: 2.3, 2.6 */
export async function createPasswordResetToken(
  readerId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await sql`
    INSERT INTO password_reset_tokens (reader_id, token_hash, expires_at)
    VALUES (${readerId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;
}

/** Invalidate all existing tokens for a reader. Requirements: 2.5 */
export async function invalidateResetTokensForReader(
  readerId: string
): Promise<void> {
  await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
}

/** Mark a token as used. Requirements: 5.5 */
export async function markResetTokenUsed(tokenHash: string): Promise<void> {
  await sql`
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE token_hash = ${tokenHash}
  `;
}

/** Count recent reset requests for an email (by reader_id) within a sliding window. Requirements: 6.1 */
export async function countRecentResetRequests(
  email: string,
  windowMinutes: number
): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM password_reset_tokens prt
    JOIN readers r ON prt.reader_id = r.id
    WHERE LOWER(r.email) = LOWER(${email})
      AND prt.created_at >= NOW() - make_interval(mins => ${windowMinutes})
  `;
  return parseInt(rows[0]?.count ?? "0", 10);
}

/** Count recent reset requests for an IP address within a sliding window. Requirements: 6.2 */
export async function countRecentResetRequestsByIp(
  ipAddress: string,
  windowMinutes: number
): Promise<number> {
  if (!ipAddress || ipAddress.trim() === "") return 0;
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM password_reset_tokens
    WHERE ip_address = ${ipAddress}
      AND created_at >= NOW() - make_interval(mins => ${windowMinutes})
  `;
  return parseInt(rows[0]?.count ?? "0", 10);
}
