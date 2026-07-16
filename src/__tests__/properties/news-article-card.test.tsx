/**
 * Property 7: News article card renders all required fields
 * Validates: Requirements 4.1, 4.4, 5.4, 8.4
 *
 * For any NewsArticleSummary with non-empty title, attribution, summary,
 * and tags, the NewsArticleCard component output should contain the article
 * title, the attribution text, the summary text, all tag strings, and a
 * link to `/updates/{slug}`.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 7
 */

// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import { NewsArticleCard } from "@/app/_components/news-article-card";
import { getNewsAttribution } from "@/lib/content";
import type { NewsArticleSummary } from "@/lib/db/types";
import type { NewsArticleType, SourcePlatform } from "@/lib/db/types";

const ARTICLE_TYPES: NewsArticleType[] = [
  "editorial",
  "campaign",
  "ranking",
  "popularity",
  "announcement",
];

const SOURCE_PLATFORMS: SourcePlatform[] = [
  "tiktok",
  "instagram",
  "x",
  "youtube",
  "facebook",
];

/** Alphanumeric + spaces tag generator — avoids HTML-special chars */
const arbTag = fc
  .stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,28}[A-Za-z0-9]$/)
  .filter((s) => s.length >= 2);

/** Arbitrary that produces a valid NewsArticleSummary with non-empty fields */
const arbNewsArticleSummary: fc.Arbitrary<NewsArticleSummary> = fc.record({
  id: fc.uuid(),
  title: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ',.!?-]{0,98}[A-Za-z]$/),
  slug: fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/),
  articleType: fc.constantFrom(...ARTICLE_TYPES),
  heroImageUrl: fc.option(fc.webUrl(), { nil: null }),
  summary: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ',.!?-]{0,198}[A-Za-z.]$/),
  tags: fc.array(arbTag, { minLength: 1, maxLength: 6 }),
  attribution: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .'-]{0,48}[A-Za-z]$/),
  sourceUrl: fc.option(fc.webUrl(), { nil: null }),
  sourcePlatform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), {
    nil: null,
  }),
  isPublished: fc.constant(true),
  isFeatured: fc.boolean(),
  featuredOrder: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  publishedAt: fc.option(
    fc.date({
      min: new Date("2020-01-01"),
      max: new Date("2030-01-01"),
      noInvalidDate: true,
    }),
    { nil: null }
  ),
  createdAt: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
  updatedAt: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
});

afterEach(() => {
  cleanup();
});

describe("Property 7: News article card renders all required fields", () => {
  it("card contains title, attribution, summary, tags, and correct link", () => {
    fc.assert(
      fc.property(arbNewsArticleSummary, (article) => {
        const { container, unmount } = render(
          <NewsArticleCard article={article} />
        );
        const text = container.textContent ?? "";

        // Title is present
        expect(text).toContain(article.title);

        // Attribution derived from getNewsAttribution is present
        const expectedAttribution = getNewsAttribution(article);
        expect(text).toContain(expectedAttribution);

        // Summary text is present
        expect(text).toContain(article.summary);

        // All tags are rendered (check textContent to avoid HTML escaping issues)
        for (const tag of article.tags) {
          expect(text).toContain(tag);
        }

        // Link points to /updates/{slug}
        const link = container.querySelector("a");
        expect(link).not.toBeNull();
        expect(link!.getAttribute("href")).toBe(
          `/updates/${encodeURIComponent(article.slug)}`
        );

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("card link has accessible aria-label containing title", () => {
    fc.assert(
      fc.property(arbNewsArticleSummary, (article) => {
        const { container, unmount } = render(
          <NewsArticleCard article={article} />
        );

        const link = container.querySelector("a");
        expect(link).not.toBeNull();
        const ariaLabel = link!.getAttribute("aria-label") ?? "";
        expect(ariaLabel).toContain(article.title);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
