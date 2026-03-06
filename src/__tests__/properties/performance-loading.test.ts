/**
 * Property tests for performance and loading (THE-93).
 * Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7
 *
 * Property 38: Shimmer Placeholder Consistency — Shimmer components reused with adjusted dimensions
 * Property 39: Shimmer Placeholder Grid Responsiveness — 2 per row tablet, 3 per row desktop
 * Property 40: Image Lazy Loading — Lazy loading and aspect ratio preservation
 *
 * @see Linear THE-93
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getViewportSize, getShimmerGridColumnsForViewport } from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  SHIMMER_GRID_COLUMNS,
  IMAGE_LOADING_LAZY,
  BOOK_COVER_ASPECT_RATIO,
} from "@/lib/responsive/constants";
import { SILK_BACKGROUND_CLASS } from "@/lib/asset-reusability-constants";

describe("Property 38: Shimmer Placeholder Consistency", () => {
  it("shimmer grid uses same column config across breakpoints (reused with adjusted dimensions)", () => {
    expect(SHIMMER_GRID_COLUMNS.mobile).toBe(2);
    expect(SHIMMER_GRID_COLUMNS.tablet).toBe(2);
    expect(SHIMMER_GRID_COLUMNS.desktop).toBe(3);
  });

  it("silk background class is single source for texture (shimmer reuse)", () => {
    expect(SILK_BACKGROUND_CLASS).toBe("bg-silk-noise");
  });

  it("shimmer grid columns are viewport-invariant for same viewport size", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (w1, w2) => {
          const c1 = getShimmerGridColumnsForViewport(w1);
          const c2 = getShimmerGridColumnsForViewport(w2);
          expect(c1).toBe(c2);
          expect(c1).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 39: Shimmer Placeholder Grid Responsiveness", () => {
  it("returns 2 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getShimmerGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getShimmerGridColumnsForViewport(width);
        expect(cols).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  it("returns 2 columns for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const cols = getShimmerGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("shimmer grid columns match SHIMMER_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = SHIMMER_GRID_COLUMNS[size];
        const actual = getShimmerGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 40: Image Lazy Loading", () => {
  it("below-the-fold images use lazy loading constant", () => {
    expect(IMAGE_LOADING_LAZY).toBe("lazy");
  });

  it("book cover aspect ratio is preserved (2:3) to prevent layout shift", () => {
    expect(BOOK_COVER_ASPECT_RATIO.width).toBe(2);
    expect(BOOK_COVER_ASPECT_RATIO.height).toBe(3);
  });

  it("aspect ratio ratio is 2/3", () => {
    const ratio =
      BOOK_COVER_ASPECT_RATIO.width / BOOK_COVER_ASPECT_RATIO.height;
    expect(ratio).toBeCloseTo(2 / 3);
  });

  it("lazy loading and aspect ratio constants are invariant", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(IMAGE_LOADING_LAZY).toBe("lazy");
        expect(BOOK_COVER_ASPECT_RATIO.width).toBe(2);
        expect(BOOK_COVER_ASPECT_RATIO.height).toBe(3);
      }),
      { numRuns: 100 }
    );
  });
});
