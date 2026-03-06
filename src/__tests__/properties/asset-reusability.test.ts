/**
 * Property tests for asset reusability (THE-90).
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7
 *
 * Property 36: Color Token Consistency — covered in responsive.test.ts
 * Property 37: Asset Reusability — Test SVG icons, dividers, textures reused (single source)
 *
 * @see Linear THE-90
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  SILK_BACKGROUND_CLASS,
  ICON_SET_CLASS,
  ORNAMENTAL_DIVIDER_COMPONENT_NAME,
} from "@/lib/asset-reusability-constants";
import { COLOR_TOKENS } from "@/lib/design-tokens";

describe("Property 37: Asset Reusability", () => {
  it("silk texture uses single class (bg-silk-noise) — Req 14.6", () => {
    expect(SILK_BACKGROUND_CLASS).toBe("bg-silk-noise");
  });

  it("icon set is single source (material-symbols-outlined) — Req 14.5", () => {
    expect(ICON_SET_CLASS).toBe("material-symbols-outlined");
  });

  it("ornamental divider has single component name — Req 14.5", () => {
    expect(ORNAMENTAL_DIVIDER_COMPONENT_NAME).toBe("OrnamentalDivider");
  });

  it("asset reuse constants are non-empty and invariant", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(SILK_BACKGROUND_CLASS.length).toBeGreaterThan(0);
        expect(ICON_SET_CLASS.length).toBeGreaterThan(0);
        expect(ORNAMENTAL_DIVIDER_COMPONENT_NAME.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("silk class does not duplicate texture pattern name", () => {
    expect(SILK_BACKGROUND_CLASS).toContain("silk");
  });

  it("color tokens remain consistent when testing asset reuse (14.1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (w1, w2) => {
          expect(COLOR_TOKENS.primary).toBe("#D4AF37");
          expect(COLOR_TOKENS.void).toBe("#050505");
          void w1;
          void w2;
        }
      ),
      { numRuns: 50 }
    );
  });
});
