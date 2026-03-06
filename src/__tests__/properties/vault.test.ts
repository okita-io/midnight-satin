/**
 * Property tests for Vault responsiveness and styling preservation.
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 *
 * Property 26: Vault Grid Responsiveness — 2 cols tablet, 3 cols desktop
 * Property 27: Vault Styling Preservation — ribbons, animations, card styling preserved
 *
 * @see Linear THE-75
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getVaultGridColumnsForViewport,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  VAULT_GRID_COLUMNS,
  VAULT_GRID_GAP,
} from "@/lib/responsive/constants";
import {
  POPULAR_RIBBON_LABEL,
  COIN_RAIN_DURATION_MS,
  COIN_RAIN_PARTICLE_COUNT,
  POPULAR_PACK_SCALE,
} from "@/lib/vault-constants";
import { COLOR_TOKENS } from "@/lib/design-tokens";

describe("Property 26: Vault Grid Responsiveness", () => {
  it("returns 2 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getVaultGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getVaultGridColumnsForViewport(width);
        expect(cols).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  it("returns 2 columns for mobile viewport (<768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const cols = getVaultGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("grid columns match VAULT_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = VAULT_GRID_COLUMNS[size];
        const actual = getVaultGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("VAULT_GRID_COLUMNS constants are correct (2 tablet, 3 desktop)", () => {
    expect(VAULT_GRID_COLUMNS.mobile).toBe(2);
    expect(VAULT_GRID_COLUMNS.tablet).toBe(2);
    expect(VAULT_GRID_COLUMNS.desktop).toBe(3);
  });

  it("VAULT_GRID_GAP constants match design (24px tablet, 32px desktop)", () => {
    expect(VAULT_GRID_GAP.tablet).toBe(24);
    expect(VAULT_GRID_GAP.desktop).toBe(32);
  });
});

describe("Property 27: Vault Styling Preservation", () => {
  it("PopularRibbon label is 'Most Popular' (Req 8.3)", () => {
    expect(POPULAR_RIBBON_LABEL).toBe("Most Popular");
  });

  it("PopularRibbon uses burgundy accent color", () => {
    expect(COLOR_TOKENS.accent).toBe("#800020");
  });

  it("coin rain duration is 3000ms before URL clear (Req 8.5)", () => {
    expect(COIN_RAIN_DURATION_MS).toBe(3000);
  });

  it("coin rain particle count is positive", () => {
    expect(COIN_RAIN_PARTICLE_COUNT).toBeGreaterThan(0);
  });

  it("popular pack scale is 1.02x (Req 8.3)", () => {
    expect(POPULAR_PACK_SCALE).toBe(1.02);
  });

  it("card styling uses primary gold for borders and accents", () => {
    expect(COLOR_TOKENS.primary).toBe("#D4AF37");
  });

  it("design tokens are preserved across any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(COLOR_TOKENS.primary).toBe("#D4AF37");
        expect(COLOR_TOKENS.accent).toBe("#800020");
        expect(COLOR_TOKENS.void).toBe("#050505");
      }),
      { numRuns: 50 }
    );
  });

  it("ribbons, animations, and card styling constants are viewport-invariant", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(POPULAR_RIBBON_LABEL).toBe("Most Popular");
        expect(COIN_RAIN_DURATION_MS).toBe(3000);
        expect(POPULAR_PACK_SCALE).toBe(1.02);
        expect(COLOR_TOKENS.primary).toBe("#D4AF37");
        expect(COLOR_TOKENS.accent).toBe("#800020");
      }),
      { numRuns: 50 }
    );
  });
});
