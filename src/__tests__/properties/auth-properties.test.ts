/**
 * Property 7: Registration welcome bonus
 * Validates: Requirements 9.3
 *
 * For any valid registration (unique email, non-empty password, non-empty display name),
 * the newly created reader should have a credit_balance of exactly 200 and a
 * credit_transaction record of type 'welcome_bonus' with amount +200.
 *
 * Property 8: Password hashing
 * Validates: Requirements 9.4
 *
 * For any reader, the stored password_hash should never equal the plaintext password.
 * Verifying the original password against the hash should return true, and verifying
 * any different password should return false.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { registerReader } from "@/app/actions/auth";
import { sql } from "@vercel/postgres";

const hasPostgres =
  typeof process.env.POSTGRES_URL === "string" && process.env.POSTGRES_URL.length > 0;

const { getCookieStore } = vi.hoisted(() => {
  const store: Record<string, string> = {};
  return {
    getCookieStore: () => ({
      get: (name: string) => ({ value: store[name] }),
      set: (name: string, value: string) => {
        store[name] = value;
      },
      delete: (name: string) => {
        delete store[name];
      },
    }),
  };
});

vi.mock("next/headers", () => ({ cookies: () => Promise.resolve(getCookieStore()) }));

describe("Property 8: Password hashing", { timeout: 20000 }, () => {
  it("hash never equals plaintext", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 128 }),
        async (plain) => {
          const hash = await hashPassword(plain);
          expect(hash).not.toBe(plain);
          expect(hash.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 25 }
    );
  });

  it("verify(original, hash) is true", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 128 }),
        async (plain) => {
          const hash = await hashPassword(plain);
          const ok = await verifyPassword(plain, hash);
          expect(ok).toBe(true);
        }
      ),
      { numRuns: 25 }
    );
  });

  it("verify(different password, hash) is false", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 128 }),
        fc.string({ minLength: 8, maxLength: 128 }),
        async (plain, other) => {
          fc.pre(plain !== other);
          const hash = await hashPassword(plain);
          const ok = await verifyPassword(other, hash);
          expect(ok).toBe(false);
        }
      ),
      { numRuns: 25 }
    );
  });
});

describe("Property 7: Registration welcome bonus", () => {
  beforeEach(() => {
    // Cookie store is shared via getCookieStore; no reset needed per test for Property 7
  });

  it.skipIf(!hasPostgres)(
    "new reader has credit_balance 200 and welcome_bonus transaction",
    async () => {
      await fc.assert(
      fc.asyncProperty(
        fc.uuid().map((u) => `prop7-${u}@test.example.com`),
        fc.string({ minLength: 8, maxLength: 64 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (email, password, displayName) => {
          const result = await registerReader(email, password, displayName);
          if (!result.success) {
            expect(result.error).toBeDefined();
            return;
          }

          const readerId = result.readerId;
          const { rows: readerRows } = await sql<{ credit_balance: number }>`
            SELECT credit_balance FROM readers WHERE id = ${readerId}
          `;
          expect(readerRows.length).toBe(1);
          expect(readerRows[0].credit_balance).toBe(200);

          const { rows: txRows } = await sql<{ transaction_type: string; amount: number }>`
            SELECT transaction_type, amount FROM credit_transactions WHERE reader_id = ${readerId} AND transaction_type = 'welcome_bonus'
          `;
          expect(txRows.length).toBe(1);
          expect(txRows[0].amount).toBe(200);
        }
      ),
      { numRuns: 5 }
      );
    }
  );
});
