/**
 * Auth unit properties after Clerk cutover.
 * Welcome bonus is granted when a Clerk user is linked/created in Neon.
 * Password hashing helpers remain for any residual migration tooling.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { upsertReaderFromClerkWebhook } from "@/lib/auth/clerk-reader";
import { sql } from "@vercel/postgres";

const hasPostgres =
  typeof process.env.POSTGRES_URL === "string" && process.env.POSTGRES_URL.length > 0;

describe("Property 8: Password hashing helpers", () => {
  it("hash never equals plaintext; verify accepts original and rejects other", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 32 }),
        fc.string({ minLength: 8, maxLength: 32 }),
        async (plain, other) => {
          fc.pre(plain !== other);
          const hash = await hashPassword(plain);
          expect(hash).not.toBe(plain);
          expect(await verifyPassword(plain, hash)).toBe(true);
          expect(await verifyPassword(other, hash)).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});

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
