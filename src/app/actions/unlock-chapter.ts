"use server";

/**
 * Unlock chapter server action (Req 4.4-4.6).
 * Uses DB transaction with row-level locking (SELECT ... FOR UPDATE) for credit safety.
 * Idempotent: already-unlocked chapters return success without deducting credits.
 */

import { sql } from "@/lib/db/postgres";
import { getSession } from "@/lib/auth/session";
import { CHAPTER_UNLOCK_COST } from "@/lib/vault-constants";

export type UnlockChapterResult =
  | { success: true; newBalance: number }
  | { success: false; error: string };

/** Check if reader has unlocked a chapter (for single-chapter check). */
export async function isChapterUnlocked(
  readerId: string,
  chapterId: string
): Promise<boolean> {
  const session = await getSession();
  if (!session || session.readerId !== readerId) return false;
  const { rows } = await sql<{ chapter_id: string }>`
    SELECT chapter_id FROM chapter_unlocks
    WHERE reader_id = ${readerId} AND chapter_id = ${chapterId}
  `;
  return rows.length > 0;
}

/**
 * Unlock a chapter for the current reader. Deducts CHAPTER_UNLOCK_COST credits.
 * Uses transaction with row-level locking on readers.credit_balance.
 * Idempotent: if already unlocked, returns success without deducting.
 */
export async function unlockChapter(
  chapterId: string
): Promise<UnlockChapterResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sign in to unlock chapters." };
  }
  const readerId = session.readerId;

  const client = await sql.connect();
  try {
    await client.sql`BEGIN`;

    // 1. Check if already unlocked (idempotent - Req 4.6)
    const { rows: unlockRows } = await client.sql<{ chapter_id: string }>`
      SELECT chapter_id FROM chapter_unlocks
      WHERE reader_id = ${readerId} AND chapter_id = ${chapterId}
    `;
    if (unlockRows.length > 0) {
      const { rows: balanceRows } = await client.sql<{ credit_balance: number }>`
        SELECT credit_balance FROM readers WHERE id = ${readerId}
      `;
      await client.sql`COMMIT`;
      const newBalance = balanceRows[0]?.credit_balance ?? 0;
      return { success: true, newBalance };
    }

    // 2. Lock reader row (row-level locking per design doc)
    const { rows: readerRows } = await client.sql<{
      credit_balance: number;
    }>`
      SELECT credit_balance FROM readers
      WHERE id = ${readerId}
      FOR UPDATE
    `;
    if (readerRows.length === 0) {
      await client.sql`ROLLBACK`;
      return { success: false, error: "Reader not found." };
    }
    const balance = Number(readerRows[0].credit_balance ?? 0);
    if (balance < CHAPTER_UNLOCK_COST) {
      await client.sql`ROLLBACK`;
      return {
        success: false,
        error: "Insufficient credits. Visit the Vault to purchase more.",
      };
    }

    // 3. Update balance, create transaction record, create unlock record
    await client.sql`
      UPDATE readers
      SET credit_balance = credit_balance - ${CHAPTER_UNLOCK_COST}
      WHERE id = ${readerId}
    `;
    await client.sql`
      INSERT INTO credit_transactions (reader_id, amount, transaction_type, related_entity_id)
      VALUES (${readerId}, ${-CHAPTER_UNLOCK_COST}, 'chapter_unlock', ${chapterId})
    `;
    await client.sql`
      INSERT INTO chapter_unlocks (reader_id, chapter_id)
      VALUES (${readerId}, ${chapterId})
    `;
    await client.sql`COMMIT`;

    return { success: true, newBalance: balance - CHAPTER_UNLOCK_COST };
  } catch (err) {
    try {
      await client.sql`ROLLBACK`;
    } catch {
      // ignore rollback error
    }
    console.error("unlockChapter error:", err);
    return {
      success: false,
      error: "Failed to unlock chapter. Please try again.",
    };
  } finally {
    client.release();
  }
}
