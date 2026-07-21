import { describe, it, expect } from "vitest";
import {
  toChapterSummary,
  type NovelChapter,
  type NovelChapterSummary,
} from "@/lib/content";
import { CHAPTER_UNLOCK_COST } from "@/lib/vault-constants";

describe("Novel Detail chapter list paywall serialization", () => {
  it("toChapterSummary omits content so locked bodies cannot ride list props", () => {
    const chapter: NovelChapter = {
      id: "ch-1",
      novelId: "novel-1",
      chapterNumber: 2,
      title: "Beyond the Veil",
      content: "SECRET locked body that must never reach the client list.",
      isFree: false,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    };

    const summary = toChapterSummary(chapter);

    expect(summary).toEqual({
      id: "ch-1",
      novelId: "novel-1",
      chapterNumber: 2,
      title: "Beyond the Veil",
      isFree: false,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    });
    expect(summary).not.toHaveProperty("content");
    expect(JSON.stringify(summary)).not.toContain("SECRET");
  });

  it("NovelChapterSummary shape has no content key", () => {
    const summary: NovelChapterSummary = {
      id: "ch-2",
      novelId: "novel-1",
      chapterNumber: 3,
      title: "Locked",
      isFree: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(Object.keys(summary).sort()).toEqual(
      [
        "chapterNumber",
        "createdAt",
        "id",
        "isFree",
        "novelId",
        "title",
        "updatedAt",
      ].sort()
    );
  });
});

describe("CHAPTER_UNLOCK_COST early-adopter pricing", () => {
  it("is 1 credit", () => {
    expect(CHAPTER_UNLOCK_COST).toBe(1);
  });
});
