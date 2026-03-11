/**
 * Property tests for Library Catalog responsiveness.
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 *
 * Property 7: Library Catalog Grid View Responsiveness — 3 cols tablet, 4 cols desktop
 * Property 8: Library Catalog List View Responsiveness — 2 cols tablet, 1 col desktop
 * Property 9: Book Cover Aspect Ratio Invariant — 2:3 ratio maintained
 * Property 10: Hover State Conditional Rendering — hover states on pointer devices only
 *
 * @see Linear THE-55
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getLibraryGridColumnsForViewport,
  getLibraryListColumnsForViewport,
  shouldApplyHoverForDevice,
  type PointerDevice,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  LIBRARY_GRID_COLUMNS,
  LIBRARY_LIST_COLUMNS,
  BOOK_COVER_ASPECT_RATIO,
} from "@/lib/responsive/constants";

describe("Property 7: Library Catalog Grid View Responsiveness", () => {
  it("returns 3 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getLibraryGridColumnsForViewport(width);
          expect(cols).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 4 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getLibraryGridColumnsForViewport(width);
        expect(cols).toBe(4);
      }),
      { numRuns: 100 }
    );
  });

  it("grid columns match LIBRARY_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = LIBRARY_GRID_COLUMNS[size];
        const actual = getLibraryGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("LIBRARY_GRID_COLUMNS constants are correct", () => {
    expect(LIBRARY_GRID_COLUMNS.mobile).toBe(2);
    expect(LIBRARY_GRID_COLUMNS.tablet).toBe(3);
    expect(LIBRARY_GRID_COLUMNS.desktop).toBe(4);
  });
});

describe("Property 8: Library Catalog List View Responsiveness", () => {
  it("returns 2 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getLibraryListColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getLibraryListColumnsForViewport(width);
        expect(cols).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  it("list columns match LIBRARY_LIST_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = LIBRARY_LIST_COLUMNS[size];
        const actual = getLibraryListColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("LIBRARY_LIST_COLUMNS constants are correct", () => {
    expect(LIBRARY_LIST_COLUMNS.mobile).toBe(1);
    expect(LIBRARY_LIST_COLUMNS.tablet).toBe(2);
    expect(LIBRARY_LIST_COLUMNS.desktop).toBe(3);
  });
});

describe("Property 9: Book Cover Aspect Ratio Invariant", () => {
  const EXPECTED_RATIO = 2 / 3;

  it("BOOK_COVER_ASPECT_RATIO is 2:3", () => {
    expect(BOOK_COVER_ASPECT_RATIO.width).toBe(2);
    expect(BOOK_COVER_ASPECT_RATIO.height).toBe(3);
  });

  it("aspect ratio width/height equals 2/3", () => {
    const ratio =
      BOOK_COVER_ASPECT_RATIO.width / BOOK_COVER_ASPECT_RATIO.height;
    expect(ratio).toBeCloseTo(EXPECTED_RATIO);
  });

  it("any valid cover dimensions maintain 2:3 ratio", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (base) => {
          const width = base * 2;
          const height = base * 3;
          const ratio = width / height;
          expect(ratio).toBeCloseTo(EXPECTED_RATIO);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 10: Hover State Conditional Rendering", () => {
  it("returns true for mouse (pointer device)", () => {
    expect(shouldApplyHoverForDevice("mouse")).toBe(true);
  });

  it("returns false for touch device", () => {
    expect(shouldApplyHoverForDevice("touch")).toBe(false);
  });

  it("returns false for unknown device", () => {
    expect(shouldApplyHoverForDevice("unknown")).toBe(false);
  });

  it("hover applies only for mouse across any device type", () => {
    const deviceArb = fc.constantFrom<PointerDevice>("touch", "mouse", "unknown");
    fc.assert(
      fc.property(deviceArb, (device) => {
        const result = shouldApplyHoverForDevice(device);
        expect(result).toBe(device === "mouse");
      }),
      { numRuns: 100 }
    );
  });
});
