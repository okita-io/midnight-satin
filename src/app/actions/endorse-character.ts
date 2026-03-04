"use server";

/**
 * Endorse character server action (Req 6.4-6.6).
 * Uses DB transaction with row-level locking for credit safety.
 * Deducts 1 credit, increments character endorsement_count, creates credit_transaction.
 * Sets has_trophy when endorsement_count exceeds 1000 (Property 5).
 */

import { sql } from "@vercel/postgres";
import { getSession } from "@/lib/auth/session";

const ENDORSEMENT_COST = 1;
const TROPHY_THRESHOLD = 1000;

export type EndorseCharacterResult =
  | { success: true; newBalance: number; newCount: number }
  | { success: false; error: string };

/**
 * Endorse a character (send a rose). Deducts 1 credit from the reader.
 * Uses transaction with row-level locking on readers.credit_balance.
 * When endorsement causes count to exceed 1000, sets has_trophy on the character.
 */
export async function endorseCharacter(
  characterId: string
): Promise<EndorseCharacterResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sign in to endorse characters." };
  }
  const readerId = session.readerId;

  const client = await sql.connect();
  try {
    await client.sql`BEGIN`;

    // 1. Verify character exists and get current endorsement_count
    const { rows: charRows } = await client.sql<{
      id: string;
      endorsement_count: number;
    }>`
      SELECT id, endorsement_count
      FROM characters
      WHERE id = ${characterId}
      FOR UPDATE
    `;
    if (charRows.length === 0) {
      await client.sql`ROLLBACK`;
      return { success: false, error: "Character not found." };
    }
    const currentCount = Number(charRows[0].endorsement_count ?? 0);
    const newCount = currentCount + 1;

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
    if (balance < ENDORSEMENT_COST) {
      await client.sql`ROLLBACK`;
      return {
        success: false,
        error: "Insufficient credits. Visit the Vault to purchase more.",
      };
    }

    // 3. Update reader balance, create transaction, update character
    await client.sql`
      UPDATE readers
      SET credit_balance = credit_balance - ${ENDORSEMENT_COST}
      WHERE id = ${readerId}
    `;
    await client.sql`
      INSERT INTO credit_transactions (reader_id, amount, transaction_type, related_entity_id)
      VALUES (${readerId}, ${-ENDORSEMENT_COST}, 'endorsement', ${characterId})
    `;
    await client.sql`
      UPDATE characters
      SET endorsement_count = endorsement_count + 1,
          has_trophy = (endorsement_count + 1) > ${TROPHY_THRESHOLD}
      WHERE id = ${characterId}
    `;
    await client.sql`COMMIT`;

    return {
      success: true,
      newBalance: balance - ENDORSEMENT_COST,
      newCount,
    };
  } catch (err) {
    try {
      await client.sql`ROLLBACK`;
    } catch {
      // ignore rollback error
    }
    console.error("endorseCharacter error:", err);
    return {
      success: false,
      error: "Failed to endorse character. Please try again.",
    };
  } finally {
    client.release();
  }
}
