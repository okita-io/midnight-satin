/**
 * Auth unit properties after Clerk cutover.
 * Welcome bonus is granted when a Clerk user is linked/created in Neon.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { upsertReaderFromClerkWebhook } from "@/lib/auth/clerk-reader";
import { sql } from "@/lib/db/postgres";

const hasPostgres =
  typeof process.env.POSTGRES_URL === "string" && process.env.POSTGRES_URL.length > 0;

describe.runIf(hasPostgres)("Property 7: Clerk signup welcome bonus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("new clerk user upsert creates reader with 200 welcome credits", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const clerkUserId = `user_test_${suffix}`;
    const email = `clerk-welcome-${suffix}@example.com`;

    await upsertReaderFromClerkWebhook({
      id: clerkUserId,
      email_addresses: [{ email_address: email }],
      first_name: "Test",
      last_name: "Reader",
    });

    const { rows: readers } = await sql<{
      id: string;
      credit_balance: number;
      clerk_user_id: string;
    }>`
      SELECT id, credit_balance, clerk_user_id FROM readers
      WHERE clerk_user_id = ${clerkUserId}
    `;
    expect(readers).toHaveLength(1);
    expect(readers[0].credit_balance).toBe(200);

    const { rows: txs } = await sql<{ amount: number; transaction_type: string }>`
      SELECT amount, transaction_type FROM credit_transactions
      WHERE reader_id = ${readers[0].id} AND transaction_type = 'welcome_bonus'
    `;
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(200);

    // Cleanup
    await sql`DELETE FROM credit_transactions WHERE reader_id = ${readers[0].id}`;
    await sql`DELETE FROM readers WHERE id = ${readers[0].id}`;
  });
});
