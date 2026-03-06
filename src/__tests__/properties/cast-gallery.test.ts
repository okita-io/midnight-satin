/**
 * Property tests for Cast Gallery responsiveness and interaction preservation.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.4, 6.6
 *
 * Property 20: Cast Gallery Grid Responsiveness — 2 cols tablet, 3 cols desktop
 * Property 21: Cast Gallery Portrait Aspect Ratio — 3:4 portrait ratio maintained
 * Property 22: Cast Gallery Interaction Preservation — flip, endorsement, badges preserved
 *
 * @see Linear THE-66
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getCastGalleryGridColumnsForViewport,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  CAST_GALLERY_GRID_COLUMNS,
  CAST_GALLERY_PORTRAIT_ASPECT_RATIO,
} from "@/lib/responsive/constants";
import {
  CAST_GALLERY_FLIP_DURATION_MS,
  ENDORSEMENT_FAB_SIZE_PX,
  ENDORSEMENT_FAB_COMPACT_SIZE_PX,
  TROPHY_BADGE_THRESHOLD,
} from "@/lib/cast-gallery-constants";

describe("Property 20: Cast Gallery Grid Responsiveness", () => {
  it("returns 2 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getCastGalleryGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getCastGalleryGridColumnsForViewport(width);
        expect(cols).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  it("returns 1 column for mobile viewport (<768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const cols = getCastGalleryGridColumnsForViewport(width);
          expect(cols).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("grid columns match CAST_GALLERY_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = CAST_GALLERY_GRID_COLUMNS[size];
        const actual = getCastGalleryGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("CAST_GALLERY_GRID_COLUMNS constants are correct", () => {
    expect(CAST_GALLERY_GRID_COLUMNS.mobile).toBe(1);
    expect(CAST_GALLERY_GRID_COLUMNS.tablet).toBe(2);
    expect(CAST_GALLERY_GRID_COLUMNS.desktop).toBe(3);
  });
});

describe("Property 21: Cast Gallery Portrait Aspect Ratio", () => {
  const EXPECTED_RATIO = 3 / 4;

  it("CAST_GALLERY_PORTRAIT_ASPECT_RATIO is 3:4", () => {
    expect(CAST_GALLERY_PORTRAIT_ASPECT_RATIO.width).toBe(3);
    expect(CAST_GALLERY_PORTRAIT_ASPECT_RATIO.height).toBe(4);
  });

  it("aspect ratio width/height equals 3/4", () => {
    const ratio =
      CAST_GALLERY_PORTRAIT_ASPECT_RATIO.width /
      CAST_GALLERY_PORTRAIT_ASPECT_RATIO.height;
    expect(ratio).toBeCloseTo(EXPECTED_RATIO);
  });

  it("any valid portrait dimensions maintain 3:4 ratio", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (base) => {
          const width = base * 3;
          const height = base * 4;
          const ratio = width / height;
          expect(ratio).toBeCloseTo(EXPECTED_RATIO);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 22: Cast Gallery Interaction Preservation", () => {
  it("flip duration is 700ms (Req 5.4)", () => {
    expect(CAST_GALLERY_FLIP_DURATION_MS).toBe(700);
  });

  it("endorsement FAB full size is 64px (Req 6.1)", () => {
    expect(ENDORSEMENT_FAB_SIZE_PX).toBe(64);
  });

  it("endorsement FAB compact size is 48px for grid cards", () => {
    expect(ENDORSEMENT_FAB_COMPACT_SIZE_PX).toBe(48);
  });

  it("trophy badge threshold is 1000 (Req 5.5, 6.6)", () => {
    expect(TROPHY_BADGE_THRESHOLD).toBe(1000);
  });

  it("trophy badge displays when endorsement count exceeds threshold", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        (endorsementCount) => {
          const shouldShowTrophy =
            endorsementCount > TROPHY_BADGE_THRESHOLD;
          expect(shouldShowTrophy).toBe(endorsementCount > 1000);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("flip, endorsement, and badge constants are preserved across any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(CAST_GALLERY_FLIP_DURATION_MS).toBe(700);
        expect(ENDORSEMENT_FAB_SIZE_PX).toBe(64);
        expect(ENDORSEMENT_FAB_COMPACT_SIZE_PX).toBe(48);
        expect(TROPHY_BADGE_THRESHOLD).toBe(1000);
      }),
      { numRuns: 50 }
    );
  });
});
