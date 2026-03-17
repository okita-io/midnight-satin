/**
 * Property 4: Token generation meets minimum entropy
 * Validates: Requirements 2.1, 2.2 (Email Password Reset)
 *
 * For any call to generateResetToken(), the token SHALL have sufficient entropy
 * to resist brute-force guessing. This property verifies:
 * - Token length meets minimum (32 bytes → 43 base64url chars)
 * - Token uses valid base64url character set (URL-safe)
 * - Tokens are pairwise distinct across many generations (no collisions)
 *
 * Property 5: Token storage round-trip
 * Validates: Requirements 2.3, 2.6 (Email Password Reset)
 *
 * For any token, hashing and "storing" the hash, then verifying with the
 * original token SHALL succeed. Verifying with a different token SHALL fail.
 * The hash SHALL be deterministic (same token → same hash).
 *
 * Property 6: Token expiration
 * Validates: Requirements 2.4 (Email Password Reset)
 *
 * For any reset token, validating it after 1 hour from its creation time
 * SHALL return an invalid/expired result. Validating it before 1 hour
 * SHALL return a valid result (assuming not used or invalidated).
 *
 * Property 10: Token validation correctness
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4 (Email Password Reset)
 *
 * For any token string, the validation function SHALL return valid: true only
 * when the token exists in the database, has not expired, and has not been used.
 * All other cases (non-existent, expired, used) SHALL return valid: false.
 *
 * Property 14: Email rate limiting
 * Validates: Requirements 6.1 (Email Password Reset)
 *
 * For any email address, after 3 reset requests within a 1-hour window,
 * subsequent requests SHALL be rate-limited (allowed: false).
 *
 * Property 15: IP rate limiting
 * Validates: Requirements 6.2 (Email Password Reset)
 *
 * For any IP address, after 10 reset requests within a 1-hour window,
 * subsequent requests SHALL be rate-limited regardless of the email used.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import {
  generateResetToken,
  hashToken,
  validateResetToken,
  checkRateLimit,
} from "@/lib/auth/password-reset";
import {
  createPasswordResetToken,
  markResetTokenUsed,
  sql,
} from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { randomUUID } from "node:crypto";

const hasPostgres =
  typeof process.env.POSTGRES_URL === "string" &&
  process.env.POSTGRES_URL.length > 0;

// Property 6 uses mocked getResetTokenByHash; Property 10 uses real DB.
// Mock delegates to real when no implementation is set.
const { mockGetResetTokenByHash } = vi.hoisted(() => ({
  mockGetResetTokenByHash: vi.fn(),
}));
vi.mock("@/lib/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db")>();
  return {
    ...actual,
    getResetTokenByHash: (tokenHash: string) => {
      if (mockGetResetTokenByHash.getMockImplementation()) {
        return mockGetResetTokenByHash(tokenHash);
      }
      return actual.getResetTokenByHash(tokenHash);
    },
  };
});

/** Base64url encodes 32 bytes to 43 characters (ceil(256/6)). */
const MIN_TOKEN_LENGTH = 43;

/** Valid base64url characters: A-Za-z0-9_- */
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

describe("Property 4: Token generation meets minimum entropy", () => {
  it("token has minimum length for 256-bit entropy", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (n) => {
        const tokens: string[] = [];
        for (let i = 0; i < n; i++) {
          const { token } = generateResetToken();
          expect(token.length).toBeGreaterThanOrEqual(MIN_TOKEN_LENGTH);
          tokens.push(token);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("token uses valid base64url character set (URL-safe)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        for (let i = 0; i < n; i++) {
          const { token } = generateResetToken();
          expect(token).toMatch(BASE64URL_PATTERN);
          expect(token).not.toContain("+");
          expect(token).not.toContain("/");
          expect(token).not.toContain("=");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("generated tokens are pairwise distinct (no collisions)", () => {
    const NUM_TOKENS = 100;
    const tokens = new Set<string>();
    const hashes = new Set<string>();

    for (let i = 0; i < NUM_TOKENS; i++) {
      const { token, tokenHash } = generateResetToken();
      expect(tokens.has(token)).toBe(false);
      expect(hashes.has(tokenHash)).toBe(false);
      tokens.add(token);
      hashes.add(tokenHash);
    }
  });

  it("token length is exactly 43 for 32-byte input (base64url)", () => {
    for (let i = 0; i < 20; i++) {
      const { token } = generateResetToken();
      expect(token.length).toBe(MIN_TOKEN_LENGTH);
    }
  });
});

/** Generator for token-like strings used in Property 5. */
const tokenLikeString = fc.string({ minLength: 1, maxLength: 128 });

describe("Property 5: Token storage round-trip", () => {
  it("stored hash verifies when submitted token matches original", () => {
    fc.assert(
      fc.property(tokenLikeString, (token) => {
        const storedHash = hashToken(token);
        const submittedToken = token;
        const verifyHash = hashToken(submittedToken);
        expect(verifyHash).toBe(storedHash);
      }),
      { numRuns: 100 }
    );
  });

  it("stored hash rejects when submitted token differs", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(tokenLikeString, { minLength: 2, maxLength: 2 }),
        ([token, other]) => {
          const storedHash = hashToken(token);
          const verifyHash = hashToken(other);
          expect(verifyHash).not.toBe(storedHash);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("hash is deterministic — same token always produces same hash", () => {
    fc.assert(
      fc.property(tokenLikeString, (token) => {
        expect(hashToken(token)).toBe(hashToken(token));
      }),
      { numRuns: 100 }
    );
  });

  it("generateResetToken round-trip: tokenHash verifies against token", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        for (let i = 0; i < n; i++) {
          const { token, tokenHash } = generateResetToken();
          expect(hashToken(token)).toBe(tokenHash);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/** One hour in milliseconds (Req 2.4). */
const ONE_HOUR_MS = 60 * 60 * 1000;

describe("Property 6: Token expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockGetResetTokenByHash.mockReset();
  });

  it("token valid before 1 hour, expired after 1 hour", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 1000 }), // creation time offset (days ago)
        fc.integer({ min: -5, max: 125 }), // minutes from creation
        async (daysAgo, offsetMinutes) => {
          const creationTime =
            Date.now() - daysAgo * 24 * 60 * 60 * 1000;
          const expiresAt = new Date(creationTime + ONE_HOUR_MS);
          const now = new Date(
            creationTime + offsetMinutes * 60 * 1000
          );

          vi.setSystemTime(now);
          mockGetResetTokenByHash.mockResolvedValue({
            readerId: "reader-1",
            expiresAt,
            usedAt: null,
          });

          const result = await validateResetToken("any-token");

          if (offsetMinutes > 60) {
            expect(result.valid).toBe(false);
            expect(result.error).toBe("expired");
          } else {
            expect(result.valid).toBe(true);
            expect(result.readerId).toBe("reader-1");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 10: Token validation correctness", () => {
  let readerId: string | undefined;

  beforeAll(async () => {
    if (!hasPostgres) return;
    readerId = randomUUID();
    const email = `prop10-${readerId}@test.example.com`;
    const passwordHash = await hashPassword("prop10-test-password");
    await sql`
      INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
      VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop10 Reader', 0, 'reader')
    `;
  });

  afterEach(async () => {
    if (!hasPostgres || !readerId) return;
    await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
  });

  afterAll(async () => {
    if (!hasPostgres || !readerId) return;
    await sql`DELETE FROM readers WHERE id = ${readerId}`;
  });

  it.skipIf(!hasPostgres)(
    "non-existent token returns valid: false, error: invalid",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 128 }),
          async (token) => {
            const result = await validateResetToken(token);
            expect(result.valid).toBe(false);
            expect(result.error).toBe("invalid");
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "valid token (exists, not expired, not used) returns valid: true with readerId",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() + 3600000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(true);
          expect(result.readerId).toBe(readerId);
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "expired token returns valid: false, error: expired",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() - 1000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(false);
          expect(result.error).toBe("expired");
        }),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "used token returns valid: false, error: used",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() + 3600000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          await markResetTokenUsed(tokenHash);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(false);
          expect(result.error).toBe("used");
        }),
        { numRuns: 100 }
      );
    }
  );
});

/** Helper: insert token with ip_address for IP rate limit tests. */
async function createPasswordResetTokenWithIp(
  readerId: string,
  tokenHash: string,
  expiresAt: Date,
  ipAddress: string
): Promise<void> {
  await sql`
    INSERT INTO password_reset_tokens (reader_id, token_hash, expires_at, ip_address)
    VALUES (${readerId}, ${tokenHash}, ${expiresAt}, ${ipAddress})
  `;
}

describe("Property 14: Email rate limiting", () => {
  it.skipIf(!hasPostgres)(
    "after 3 reset requests for same email, checkRateLimit returns allowed: false",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop14-${u}@test.example.com`),
          async (email) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop14-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop14 Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < 3; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetToken(readerId, tokenHash, expiresAt);
              }
              const result = await checkRateLimit(email, "192.168.1.1");
              expect(result.allowed).toBe(false);
              expect(result.retryAfterSeconds).toBe(3600);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "with 0, 1, or 2 requests for same email, checkRateLimit returns allowed: true",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop14b-${u}@test.example.com`),
            count: fc.integer({ min: 0, max: 2 }),
          }),
          async ({ email, count }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop14b-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop14b Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < count; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetToken(readerId, tokenHash, expiresAt);
              }
              const result = await checkRateLimit(email, "10.0.0.1");
              expect(result.allowed).toBe(true);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

describe("Property 15: IP rate limiting", () => {
  it.skipIf(!hasPostgres)(
    "after 10 reset requests from same IP, checkRateLimit returns allowed: false",
    async () => {
      const ipArb = fc
        .tuple(
          fc.integer(1, 254),
          fc.integer(0, 255),
          fc.integer(0, 255),
          fc.integer(1, 254)
        )
        .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop15-${u}@test.example.com`),
            ip: ipArb,
          }),
          async ({ email, ip }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop15-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop15 Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < 10; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetTokenWithIp(
                  readerId,
                  tokenHash,
                  expiresAt,
                  ip
                );
              }
              const result = await checkRateLimit(email, ip);
              expect(result.allowed).toBe(false);
              expect(result.retryAfterSeconds).toBe(3600);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "with 0 to 9 requests from same IP, checkRateLimit returns allowed: true",
    async () => {
      const ipArb = fc
        .tuple(
          fc.integer(1, 254),
          fc.integer(0, 255),
          fc.integer(0, 255),
          fc.integer(1, 254)
        )
        .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop15b-${u}@test.example.com`),
            ip: ipArb,
            count: fc.integer({ min: 0, max: 9 }),
          }),
          async ({ email, ip, count }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop15b-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop15b Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < count; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetTokenWithIp(
                  readerId,
                  tokenHash,
                  expiresAt,
                  ip
                );
              }
              const result = await checkRateLimit(email, ip);
              expect(result.allowed).toBe(true);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
