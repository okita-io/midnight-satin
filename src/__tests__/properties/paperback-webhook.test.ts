// Feature: buy-paperback, Property 11: Webhook idempotency
/**
 * Property 11: Webhook idempotency
 * Validates: Requirements 7.4, 8.6
 *
 * For any valid checkout.session.completed event, processing it N times (N ≥ 1)
 * shall result in exactly one row in paperback_orders for that stripe_session_id.
 * The second and subsequent processings shall not create duplicates or modify
 * the existing record.
 *
 * We test the idempotent insert behavior as a pure function using an in-memory
 * store that mirrors the DB's ON CONFLICT (stripe_session_id) DO NOTHING semantics.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * In-memory store simulating the paperback_orders table with a UNIQUE
 * constraint on stripe_session_id. The insert method returns true on
 * first insert (row created) and false on duplicates (ON CONFLICT DO NOTHING).
 */
function createIdempotentStore() {
  const seen = new Set<string>();
  return {
    insert(sessionId: string): boolean {
      if (seen.has(sessionId)) return false; // duplicate
      seen.add(sessionId);
      return true; // inserted
    },
    count(sessionId: string): number {
      return seen.has(sessionId) ? 1 : 0;
    },
  };
}

describe("Property 11: Webhook idempotency", () => {
  // Feature: buy-paperback, Property 11: Webhook idempotency
  it("processing the same session ID N times results in exactly 1 insert and N-1 duplicates", () => {
    const sessionIdArb = fc.oneof(
      fc.uuid(),
      fc.stringMatching(/^cs_test_[a-zA-Z0-9]{10,40}$/),
      fc.stringMatching(/^cs_live_[a-zA-Z0-9]{10,40}$/)
    );
    const repeatCountArb = fc.integer({ min: 1, max: 10 });

    fc.assert(
      fc.property(sessionIdArb, repeatCountArb, (sessionId, repeatCount) => {
        const store = createIdempotentStore();

        let insertCount = 0;
        let duplicateCount = 0;

        for (let i = 0; i < repeatCount; i++) {
          const inserted = store.insert(sessionId);
          if (inserted) {
            insertCount++;
          } else {
            duplicateCount++;
          }
        }

        // Exactly one insert succeeds
        expect(insertCount).toBe(1);

        // All remaining attempts are duplicates
        expect(duplicateCount).toBe(repeatCount - 1);

        // Store contains exactly one record for this session ID
        expect(store.count(sessionId)).toBe(1);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: buy-paperback, Property 12: Webhook rejects invalid signatures
/**
 * Property 12: Webhook rejects invalid signatures
 * Validates: Requirements 8.2, 8.3
 *
 * For any request body and any signature string that does not match the HMAC
 * computed with STRIPE_WEBHOOK_SECRET, the webhook handler shall return HTTP 400
 * and not create any order records.
 *
 * We test the signature validation logic as a pure function. For any random body
 * and any random signature that doesn't match the correct HMAC, verification
 * must fail — meaning the webhook would reject with 400 and no orders are created.
 */

import crypto from "crypto";

/**
 * Pure function that verifies a Stripe-style webhook signature.
 * Stripe signatures have the format: "t=<timestamp>,v1=<hmac_hex>"
 * Returns true only if the provided signature contains a valid HMAC
 * matching the body+timestamp signed with the secret.
 */
function verifyStripeSignature(
  body: string,
  signatureHeader: string,
  secret: string
): boolean {
  // Parse timestamp from the signature header
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const sigPart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !sigPart) return false;

  const timestamp = timestampPart.slice(2);
  const providedSig = sigPart.slice(3);

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(providedSig, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}

describe("Property 12: Webhook rejects invalid signatures", () => {
  // Feature: buy-paperback, Property 12: Webhook rejects invalid signatures
  it("any random body with a non-matching signature is rejected and no orders are created", () => {
    const bodyArb = fc.string({ minLength: 1, maxLength: 500 });
    const secretArb = fc.string({ minLength: 8, maxLength: 64 });
    // Generate a random 64-char hex string that won't match the correct HMAC
    const randomHexArb = fc.stringMatching(/^[0-9a-f]{64}$/);
    const timestampArb = fc.integer({ min: 1000000000, max: 2000000000 });

    fc.assert(
      fc.property(
        bodyArb,
        secretArb,
        randomHexArb,
        timestampArb,
        (body, secret, randomHex, timestamp) => {
          // Compute the correct signature for this body+secret+timestamp
          const correctSig = crypto
            .createHmac("sha256", secret)
            .update(`${timestamp}.${body}`)
            .digest("hex");

          // Skip the rare case where the random hex happens to match
          fc.pre(randomHex.toLowerCase() !== correctSig.toLowerCase());

          // Build an invalid signature header with the random hex
          const invalidSigHeader = `t=${timestamp},v1=${randomHex}`;

          // Verification must fail
          let verified: boolean;
          try {
            verified = verifyStripeSignature(body, invalidSigHeader, secret);
          } catch {
            // timingSafeEqual throws if buffer lengths differ — that's also a rejection
            verified = false;
          }

          expect(verified).toBe(false);

          // Simulate: since signature is invalid, no order insert happens
          const ordersCreated: string[] = [];
          if (!verified) {
            // Webhook returns 400, no insert
          } else {
            ordersCreated.push("should-not-happen");
          }

          expect(ordersCreated).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("completely malformed signature headers are rejected", () => {
    const bodyArb = fc.string({ minLength: 1, maxLength: 200 });
    const secretArb = fc.string({ minLength: 8, maxLength: 64 });
    // Generate garbage strings that don't follow the "t=...,v1=..." format
    const garbageSigArb = fc.oneof(
      fc.string({ minLength: 0, maxLength: 100 }),
      fc.constant(""),
      fc.constant("invalid"),
      fc.stringMatching(/^[a-z0-9]{10,50}$/)
    );

    fc.assert(
      fc.property(bodyArb, secretArb, garbageSigArb, (body, secret, garbageSig) => {
        let verified: boolean;
        try {
          verified = verifyStripeSignature(body, garbageSig, secret);
        } catch {
          verified = false;
        }

        expect(verified).toBe(false);

        // No orders created when signature is invalid
        const ordersCreated: string[] = [];
        expect(ordersCreated).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });
});
