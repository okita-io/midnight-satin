/**
 * Property tests for responsive foundation.
 * Validates: Requirements 1.3, 1.4, 1.5, 14.2
 *
 * Property 1: Viewport Layout Mapping — For any viewport width, the correct layout tier is returned.
 * Property 36: Color Token Consistency — Color tokens match across viewports and design spec.
 *
 * @see Linear THE-46
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getViewportSize } from "@/lib/responsive/utils";
import { BREAKPOINTS, GRID_COLUMNS } from "@/lib/responsive/constants";
import {
  getColorTokensForViewport,
  COLOR_TOKENS,
} from "@/lib/design-tokens";

describe("Property 1: Viewport Layout Mapping", () => {
  it("returns mobile for width < md (768px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 767 }), (width) => {
        const size = getViewportSize(width);
        expect(size).toBe("mobile");
      }),
      { numRuns: 100 }
    );
  });

  it("returns tablet for md <= width < lg (768-1023px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 768, max: 1023 }), (width) => {
        const size = getViewportSize(width);
        expect(size).toBe("tablet");
      }),
      { numRuns: 100 }
    );
  });

  it("returns desktop for width >= lg (1024px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1024, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        expect(size).toBe("desktop");
      }),
      { numRuns: 100 }
    );
  });

  it("correct layout tier for any viewport width", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected =
          width >= BREAKPOINTS.lg
            ? "desktop"
            : width >= BREAKPOINTS.md
              ? "tablet"
              : "mobile";
        expect(size).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("GRID_COLUMNS matches layout tiers", () => {
    expect(GRID_COLUMNS.mobile).toBe(1);
    expect(GRID_COLUMNS.tablet).toBe(2);
    expect(GRID_COLUMNS.desktop).toBe(3);
  });
});

describe("Property 36: Color Token Consistency", () => {
  const DESIGN_SPEC = {
    primary: "#D4AF37",
    void: "#050505",
    surface: "#121212",
    text: "#EAEAEA",
    muted: "#8A8A8A",
    accent: "#800020",
  } as const;

  it("color tokens match design spec (Requirements 14.1)", () => {
    expect(COLOR_TOKENS.primary).toBe(DESIGN_SPEC.primary);
    expect(COLOR_TOKENS.void).toBe(DESIGN_SPEC.void);
    expect(COLOR_TOKENS.surface).toBe(DESIGN_SPEC.surface);
    expect(COLOR_TOKENS.text).toBe(DESIGN_SPEC.text);
    expect(COLOR_TOKENS.muted).toBe(DESIGN_SPEC.muted);
    expect(COLOR_TOKENS.accent).toBe(DESIGN_SPEC.accent);
  });

  it("color tokens are identical across any viewport width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (width1, width2) => {
          const tokens1 = getColorTokensForViewport(width1);
          const tokens2 = getColorTokensForViewport(width2);
          expect(tokens1).toBe(tokens2);
          expect(tokens1.primary).toBe(tokens2.primary);
          expect(tokens1.void).toBe(tokens2.void);
          expect(tokens1.surface).toBe(tokens2.surface);
          expect(tokens1.text).toBe(tokens2.text);
          expect(tokens1.muted).toBe(tokens2.muted);
          expect(tokens1.accent).toBe(tokens2.accent);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("all color tokens are valid hex format", () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    expect(COLOR_TOKENS.primary).toMatch(hexPattern);
    expect(COLOR_TOKENS.void).toMatch(hexPattern);
    expect(COLOR_TOKENS.surface).toMatch(hexPattern);
    expect(COLOR_TOKENS.text).toMatch(hexPattern);
    expect(COLOR_TOKENS.muted).toMatch(hexPattern);
    expect(COLOR_TOKENS.accent).toMatch(hexPattern);
  });
});
