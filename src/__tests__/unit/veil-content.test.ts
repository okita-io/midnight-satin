import { describe, it, expect } from "vitest";
import {
  FREE_PREVIEW_PARAGRAPHS,
  VEIL_BLURRED_TEASER_PARAGRAPHS,
  teaserContentForLockedChapter,
  splitChapterParagraphs,
} from "@/lib/reading/veil-content";

describe("teaserContentForLockedChapter", () => {
  it("never returns more than preview + teaser paragraphs", () => {
    const paragraphs = Array.from({ length: 40 }, (_, i) => `Paragraph ${i + 1}.`);
    const full = paragraphs.join("\n\n");
    const teaser = teaserContentForLockedChapter(full);
    const out = splitChapterParagraphs(teaser);
    expect(out).toHaveLength(
      FREE_PREVIEW_PARAGRAPHS + VEIL_BLURRED_TEASER_PARAGRAPHS
    );
    expect(teaser).not.toContain("Paragraph 40.");
    expect(teaser).toContain("Paragraph 1.");
  });

  it("returns full content when shorter than teaser window", () => {
    const full = "One.\n\nTwo.";
    expect(teaserContentForLockedChapter(full)).toBe(full);
  });
});
