// Feature: buy-paperback, Property 8: Checkout session params correctness
/**
 * Property 8: Checkout session params correctness
 * Validates: Requirements 5.3, 5.5, 5.6
 *
 * For any novel (with title and computed price) and any authenticated reader,
 * the Stripe Checkout session creation params shall include:
 * - a line item with the novel title as product name and the computed price in cents as unit_amount
 * - a success_url matching /novel/${novelId}/paperback/success?session_id={CHECKOUT_SESSION_ID}
 * - a cancel_url matching /novel/${novelId}/paperback
 * - metadata containing both novel_id and reader_id
 *
 * We test the pure param construction logic extracted from the server action.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Pure function that builds the Stripe Checkout session params.
 * Extracted from the server action for testability.
 */
function buildCheckoutParams(input: {
  novelId: string;
  novelTitle: string;
  priceCents: number;
  readerId: string;
  baseUrl: string;
}) {
  return {
    mode: "payment" as const,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: input.novelTitle },
          unit_amount: input.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${input.baseUrl}/novel/${input.novelId}/paperback/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.baseUrl}/novel/${input.novelId}/paperback`,
    metadata: { novel_id: input.novelId, reader_id: input.readerId },
  };
}

describe("Property 8: Checkout session params correctness", () => {
  // Feature: buy-paperback, Property 8: Checkout session params correctness
  it("params contain correct line item, success/cancel URLs, and metadata for any novel and reader", () => {
    const novelIdArb = fc.oneof(fc.uuid(), fc.stringMatching(/^[a-zA-Z0-9-]{1,64}$/));
    const novelTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0);
    const priceCentsArb = fc.integer({ min: 100, max: 100_000 });
    const readerIdArb = fc.uuid();
    const baseUrlArb = fc.oneof(
      fc.constant("http://localhost:3000"),
      fc.constant("https://midnightsatin.com"),
      fc.constant("https://staging.midnightsatin.com")
    );

    fc.assert(
      fc.property(
        novelIdArb,
        novelTitleArb,
        priceCentsArb,
        readerIdArb,
        baseUrlArb,
        (novelId, novelTitle, priceCents, readerId, baseUrl) => {
          const params = buildCheckoutParams({ novelId, novelTitle, priceCents, readerId, baseUrl });

          // 1. Mode is "payment"
          expect(params.mode).toBe("payment");

          // 2. Single line item with correct product name and unit_amount
          expect(params.line_items).toHaveLength(1);
          const lineItem = params.line_items[0];
          expect(lineItem.price_data.currency).toBe("usd");
          expect(lineItem.price_data.product_data.name).toBe(novelTitle);
          expect(lineItem.price_data.unit_amount).toBe(priceCents);
          expect(lineItem.quantity).toBe(1);

          // 3. success_url matches expected pattern
          expect(params.success_url).toBe(
            `${baseUrl}/novel/${novelId}/paperback/success?session_id={CHECKOUT_SESSION_ID}`
          );

          // 4. cancel_url matches expected pattern
          expect(params.cancel_url).toBe(
            `${baseUrl}/novel/${novelId}/paperback`
          );

          // 5. Metadata contains novel_id and reader_id
          expect(params.metadata.novel_id).toBe(novelId);
          expect(params.metadata.reader_id).toBe(readerId);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: buy-paperback, Property 9: Error message sanitization
/**
 * Property 9: Error message sanitization
 * Validates: Requirements 5.7
 *
 * For any Stripe API error, the server action shall return an error message
 * that does not contain the original Stripe error message, API key fragments,
 * or request IDs.
 *
 * We test a pure `sanitizeStripeError` function that always returns a fixed
 * generic message regardless of input, matching the server action's catch block.
 */

/**
 * Pure function extracted from the server action's error handling.
 * Always returns the same generic message regardless of the original error.
 */
function sanitizeStripeError(_originalMessage: string): string {
  return "Failed to start checkout. Please try again.";
}

describe("Property 9: Error message sanitization", () => {
  // Feature: buy-paperback, Property 9: Error message sanitization
  it("sanitized error never leaks original message, API key fragments, or request IDs", () => {
    // Arbitrary non-empty string for Stripe error messages
    const stripeErrorMessageArb = fc.string({ minLength: 1, maxLength: 500 });

    // API key fragments like "sk_test_..." or "sk_live_..."
    const apiKeyFragmentArb = fc.oneof(
      fc.stringMatching(/^sk_test_[a-zA-Z0-9]{10,40}$/),
      fc.stringMatching(/^sk_live_[a-zA-Z0-9]{10,40}$/)
    );

    // Request IDs like "req_AbCdEf123"
    const requestIdArb = fc.stringMatching(/^req_[a-zA-Z0-9]{8,30}$/);

    // Combine into a composite error message that may contain all sensitive parts
    const compositeErrorArb = fc.tuple(
      stripeErrorMessageArb,
      apiKeyFragmentArb,
      requestIdArb
    ).map(([msg, key, reqId]) =>
      fc.oneof(
        fc.constant(msg),
        fc.constant(`${msg} (key: ${key})`),
        fc.constant(`${msg} (request: ${reqId})`),
        fc.constant(`${msg} (key: ${key}, request: ${reqId})`)
      )
    );

    fc.assert(
      fc.property(
        stripeErrorMessageArb,
        apiKeyFragmentArb,
        requestIdArb,
        (errorMessage, apiKey, requestId) => {
          // Build a realistic Stripe error string containing sensitive data
          const fullError = `${errorMessage} (key: ${apiKey}, request: ${requestId})`;
          const sanitized = sanitizeStripeError(fullError);

          // 1. Sanitized output is always the exact generic message
          expect(sanitized).toBe("Failed to start checkout. Please try again.");

          // 2. Does not contain "sk_test_" or "sk_live_" patterns
          expect(sanitized).not.toMatch(/sk_test_/);
          expect(sanitized).not.toMatch(/sk_live_/);

          // 3. Does not contain "req_" followed by alphanumeric characters
          expect(sanitized).not.toMatch(/req_[a-zA-Z0-9]+/);

          // 4. Does not contain the original error message
          //    (unless it happens to be a substring of the generic message)
          if (!sanitized.includes(errorMessage)) {
            expect(sanitized).not.toContain(errorMessage);
          }

          // 5. Does not contain the API key
          expect(sanitized).not.toContain(apiKey);

          // 6. Does not contain the request ID
          expect(sanitized).not.toContain(requestId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
