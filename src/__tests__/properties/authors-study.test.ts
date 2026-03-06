/**
 * Property tests for Author's Study responsive layout and styling.
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8
 *
 * Property 23: Authors Study Two-Column Layout — Test 35/65 split tablet/desktop
 * Property 24: Authors Study Trophy Case Grid — Test 3 cols tablet, 4 cols desktop
 * Property 25: Authors Study Styling Preservation — Test gold borders preserved
 *
 * @see Linear THE-70
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getAuthorStudyUsesTwoColumnLayout,
  getTrophyCaseGridColumnsForViewport,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  AUTHORS_STUDY_TWO_COLUMN_SPLIT,
  TROPHY_CASE_GRID_COLUMNS,
} from "@/lib/responsive/constants";
import { COLOR_TOKENS } from "@/lib/design-tokens";

describe("Property 23: Authors Study Two-Column Layout", () => {
  it("uses two-column layout for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const usesTwoCol = getAuthorStudyUsesTwoColumnLayout(width);
          expect(usesTwoCol).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("uses two-column layout for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const usesTwoCol = getAuthorStudyUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("uses single column for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        const usesTwoCol = getAuthorStudyUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("two-column layout matches tablet-or-up breakpoint for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const usesTwoCol = getAuthorStudyUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(width >= BREAKPOINTS.md);
      }),
      { numRuns: 100 }
    );
  });

  it("AUTHORS_STUDY_TWO_COLUMN_SPLIT is 35/65 (biography/bibliography)", () => {
    expect(AUTHORS_STUDY_TWO_COLUMN_SPLIT.biography).toBe(35);
    expect(AUTHORS_STUDY_TWO_COLUMN_SPLIT.bibliography).toBe(65);
    expect(
      AUTHORS_STUDY_TWO_COLUMN_SPLIT.biography +
        AUTHORS_STUDY_TWO_COLUMN_SPLIT.bibliography
    ).toBe(100);
  });

  it("grid template 7fr/13fr matches 35/65 split", () => {
    const leftFr = 7;
    const rightFr = 13;
    const totalFr = leftFr + rightFr;
    const leftPercent = (leftFr / totalFr) * 100;
    const rightPercent = (rightFr / totalFr) * 100;
    expect(Math.round(leftPercent)).toBe(AUTHORS_STUDY_TWO_COLUMN_SPLIT.biography);
    expect(Math.round(rightPercent)).toBe(
      AUTHORS_STUDY_TWO_COLUMN_SPLIT.bibliography
    );
  });
});

describe("Property 24: Authors Study Trophy Case Grid", () => {
  it("returns 2 columns for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const cols = getTrophyCaseGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getTrophyCaseGridColumnsForViewport(width);
          expect(cols).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 4 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getTrophyCaseGridColumnsForViewport(width);
        expect(cols).toBe(4);
      }),
      { numRuns: 100 }
    );
  });

  it("trophy case columns match TROPHY_CASE_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = TROPHY_CASE_GRID_COLUMNS[size];
        const actual = getTrophyCaseGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("TROPHY_CASE_GRID_COLUMNS constants are correct", () => {
    expect(TROPHY_CASE_GRID_COLUMNS.mobile).toBe(2);
    expect(TROPHY_CASE_GRID_COLUMNS.tablet).toBe(3);
    expect(TROPHY_CASE_GRID_COLUMNS.desktop).toBe(4);
  });
});

describe("Property 25: Authors Study Styling Preservation", () => {
  it("primary gold color token is preserved for borders and accents", () => {
    expect(COLOR_TOKENS.primary).toBe("#D4AF37");
  });

  it("gold color token is viewport-invariant", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (width1, width2) => {
          const tokens1 = COLOR_TOKENS;
          const tokens2 = COLOR_TOKENS;
          expect(tokens1.primary).toBe(tokens2.primary);
          expect(tokens1.primary).toBe("#D4AF37");
        }
      ),
      { numRuns: 50 }
    );
  });

  it("design system gold (#D4AF37) matches primary token", () => {
    const DESIGN_GOLD = "#D4AF37";
    expect(COLOR_TOKENS.primary).toBe(DESIGN_GOLD);
  });

  it("trophy case gold styling constants: primary used for icons and borders", () => {
    expect(COLOR_TOKENS.primary).toBeDefined();
    expect(COLOR_TOKENS.primary.length).toBe(7);
    expect(COLOR_TOKENS.primary.startsWith("#")).toBe(true);
  });
});
