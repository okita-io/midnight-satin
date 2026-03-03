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
