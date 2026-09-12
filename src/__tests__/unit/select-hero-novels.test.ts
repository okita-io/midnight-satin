import { describe, it, expect } from "vitest";
import { selectHeroNovels } from "@/lib/content";

const day = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`);

describe("selectHeroNovels", () => {
  it("puts the newest library entry first even when older titles are featured", () => {
    const featured = [
      { id: "older-featured", createdAt: day("2026-01-01") },
      { id: "mid-featured", createdAt: day("2026-06-01") },
    ];
    const recent = [
      { id: "newest", createdAt: day("2026-09-12") },
      { id: "mid-featured", createdAt: day("2026-06-01") },
      { id: "older-featured", createdAt: day("2026-01-01") },
    ];
    expect(selectHeroNovels(featured, recent, 3).map((n) => n.id)).toEqual([
      "newest",
      "mid-featured",
      "older-featured",
    ]);
  });

  it("uses publication date when it is later than created_at", () => {
    const featured = [{ id: "a", createdAt: day("2026-01-01"), publicationDate: day("2026-08-01") }];
    const recent = [{ id: "b", createdAt: day("2026-07-01"), publicationDate: null }];
    expect(selectHeroNovels(featured, recent, 2).map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("does not invent extra items when the catalog is smaller than the limit", () => {
    expect(
      selectHeroNovels(
        [{ id: "a", createdAt: day("2026-01-01") }],
        [{ id: "a", createdAt: day("2026-01-01") }],
        3
      ).map((n) => n.id)
    ).toEqual(["a"]);
  });

  it("returns an empty list when both sources are empty", () => {
    expect(selectHeroNovels([], [], 3)).toEqual([]);
  });
});
