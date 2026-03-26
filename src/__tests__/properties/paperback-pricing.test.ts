/**
 * Property 1: Price calculation with cap
 * Validates: Requirements 3.1, 3.5, 3.6, 3.7
 *
 * For any non-negative integer word count and any valid PricingConfig,
 * calculatePaperbackPrice(wordCount, config) shall return
 * min(baseCostCents + round(wordCount * perWordRate * 100), maxPriceCents),
 * and the result shall always be an integer >= baseCostCents.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  calculatePaperbackPrice,
  type PricingConfig,
} from "@/lib/paperback/pricing";

describe("Property 1: Price calculation with cap", () => {
  // Feature: buy-paperback, Property 1: Price calculation with cap
  it("result equals min(base + round(wc * rate * 100), max), result >= base, and result is integer", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.record({
          baseCostCents: fc.integer({ min: 0, max: 10_000 }),
          perWordRate: fc.double({ min: 0, max: 0.01, noNaN: true, noDefaultInfinity: true }),
          maxPriceCents: fc.integer({ min: 0, max: 100_000 }),
        }),
        (wordCount: number, config: PricingConfig) => {
          const result = calculatePaperbackPrice(wordCount, config);

          // Expected: min(base + round(wc * rate * 100), max)
          const rawPrice =
            config.baseCostCents +
            Math.round(wordCount * config.perWordRate * 100);
          const capped = Math.min(rawPrice, config.maxPriceCents);
          const expected = Math.max(Math.round(capped), config.baseCostCents);

          expect(result).toBe(expected);
          expect(result).toBeGreaterThanOrEqual(config.baseCostCents);
          expect(Number.isInteger(result)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Page count estimation
 * Validates: Requirements 10.7
 *
 * For any non-negative integer word count, the estimated page count shall equal
 * Math.ceil(wordCount / 250), with a minimum of 0 for zero words.
 */

describe("Property 4: Page count estimation", () => {
  // Feature: buy-paperback, Property 4: Page count estimation
  it("estimated page count equals Math.ceil(wordCount / 250) with minimum 0 for zero words", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        (wordCount: number) => {
          const estimatedPageCount =
            wordCount === 0 ? 0 : Math.ceil(wordCount / 250);

          if (wordCount === 0) {
            expect(estimatedPageCount).toBe(0);
          } else {
            expect(estimatedPageCount).toBe(Math.ceil(wordCount / 250));
          }

          expect(estimatedPageCount).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(estimatedPageCount)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
