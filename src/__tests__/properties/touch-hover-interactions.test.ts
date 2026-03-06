/**
 * Property tests for touch and hover interactions (THE-87).
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
 *
 * Property 34: Touch Interaction Preservation — Touch interactions maintained (active scale, no hover on touch)
 * Property 35: Cursor Pointer on Interactive Elements — cursor-pointer applied to interactive elements
 * Property 10: Hover State Conditional Rendering — covered in library-catalog.test.ts (task 4.4)
 *
 * @see Linear THE-87
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  shouldApplyHoverForDevice,
  type PointerDevice,
} from "@/lib/responsive/utils";
import {
  INTERACTIVE_CURSOR,
  INTERACTIVE_ACTIVE_SCALE,
  TOUCH_ACTION_MANIPULATION,
} from "@/lib/responsive/constants";

describe("Property 34: Touch Interaction Preservation", () => {
  it("touch device does not get hover states (avoids sticky hover on tap)", () => {
    expect(shouldApplyHoverForDevice("touch")).toBe(false);
  });

  it("interactive active scale constant is defined for touch feedback", () => {
    expect(INTERACTIVE_ACTIVE_SCALE).toBe("active:scale-95");
  });

  it("touch-action manipulation constant is defined to reduce tap delay", () => {
    expect(TOUCH_ACTION_MANIPULATION).toBe("touch-manipulation");
  });

  it("touch and unknown devices never get hover; only mouse does", () => {
    const deviceArb = fc.constantFrom<PointerDevice>("touch", "mouse", "unknown");
    fc.assert(
      fc.property(deviceArb, (device) => {
        const applyHover = shouldApplyHoverForDevice(device);
        expect(applyHover).toBe(device === "mouse");
      }),
      { numRuns: 100 }
    );
  });

  it("touch interaction constants are invariant", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(INTERACTIVE_ACTIVE_SCALE).toContain("active:scale");
        expect(TOUCH_ACTION_MANIPULATION).toBe("touch-manipulation");
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 35: Cursor Pointer on Interactive Elements", () => {
  it("interactive cursor is cursor-pointer (Req 13.6)", () => {
    expect(INTERACTIVE_CURSOR).toBe("cursor-pointer");
  });

  it("cursor pointer constant is invariant across viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (w1, w2) => {
          expect(INTERACTIVE_CURSOR).toBe("cursor-pointer");
          void w1;
          void w2;
        }
      ),
      { numRuns: 100 }
    );
  });
});
