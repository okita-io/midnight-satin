/**
 * Property 13: Navigation link construction
 * Validates: Requirements 1.5, 2.8, 2.9, 7.7
 *
 * For any novel ID, the navigation link from a novel card should resolve to /novel/{novelId}.
 * For any author ID, the author link should resolve to /author/{authorId}.
 * For any chapter ID within a novel, the reading link should resolve to /novel/{novelId}/read/{chapterId}.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  novelDetailPath,
  authorStudyPath,
  readingRoomPath,
} from "@/lib/navigation";

describe("Property 13: Navigation link construction", () => {
  it("novelDetailPath(novelId) produces /novel/{encoded novelId}", () => {
    fc.assert(
      fc.property(fc.uuid(), (novelId) => {
        const path = novelDetailPath(novelId);
        expect(path).toBe(`/novel/${encodeURIComponent(novelId)}`);
        expect(path.startsWith("/novel/")).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("authorStudyPath(authorId) produces /author/{encoded authorId}", () => {
    fc.assert(
      fc.property(fc.uuid(), (authorId) => {
        const path = authorStudyPath(authorId);
        expect(path).toBe(`/author/${encodeURIComponent(authorId)}`);
        expect(path.startsWith("/author/")).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("readingRoomPath(novelId, chapterId) produces /novel/{novelId}/read/{chapterId}", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (novelId, chapterId) => {
        const path = readingRoomPath(novelId, chapterId);
        expect(path).toBe(
          `/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`
        );
        expect(path.startsWith("/novel/")).toBe(true);
        expect(path).toContain("/read/");
      }),
      { numRuns: 100 }
    );
  });
});
