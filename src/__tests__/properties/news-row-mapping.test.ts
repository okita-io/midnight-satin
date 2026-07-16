/**
 * Property 1: News article row mapping round-trip
 * Validates: Requirements 1.1
 *
 * For any valid NewsArticle object, converting it to a database row
 * representation and back via rowToNewsArticle should produce an
 * equivalent object (with appropriate type coercions for dates and arrays).
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 1
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { rowToNewsArticle, rowToNewsArticleSummary } from "@/lib/content";
import type { NewsArticleRow } from "@/lib/content";
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

/** Arbitrary that produces a valid NewsArticleRow */
const arbNewsArticleRow: fc.Arbitrary<NewsArticleRow> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: fc.string({ minLength: 1, maxLength: 100 }),
  article_type: fc.constantFrom(...ARTICLE_TYPES),
  hero_image_url: fc.option(fc.webUrl(), { nil: null }),
  summary: fc.string({ minLength: 1, maxLength: 500 }),
  body_content: fc.string({ minLength: 1, maxLength: 2000 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 8 }),
  attribution: fc.string({ minLength: 1, maxLength: 100 }),
  source_url: fc.option(fc.webUrl(), { nil: null }),
  source_platform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), { nil: null }),
  is_published: fc.boolean(),
  is_featured: fc.boolean(),
  featured_order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  published_at: fc.option(
    fc.date({
      min: new Date("2020-01-01"),
      max: new Date("2030-01-01"),
      noInvalidDate: true,
    }),
    { nil: null }
  ),
  created_at: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
  updated_at: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
});

describe("Property 1: News article row mapping round-trip", () => {
  it("rowToNewsArticle preserves all fields from a NewsArticleRow", () => {
    fc.assert(
      fc.property(arbNewsArticleRow, (row) => {
        const article = rowToNewsArticle(row);

        expect(article.id).toBe(row.id);
        expect(article.title).toBe(row.title);
        expect(article.slug).toBe(row.slug);
        expect(article.articleType).toBe(row.article_type);
        expect(article.heroImageUrl).toBe(row.hero_image_url);
        expect(article.summary).toBe(row.summary);
        expect(article.bodyContent).toBe(row.body_content);
        expect(article.tags).toEqual(row.tags);
        expect(article.attribution).toBe(row.attribution);
        expect(article.sourceUrl).toBe(row.source_url);
        expect(article.sourcePlatform).toBe(row.source_platform);
        expect(article.isPublished).toBe(row.is_published);
        expect(article.isFeatured).toBe(row.is_featured);
        expect(article.featuredOrder).toBe(row.featured_order);

        // Date fields: rowToNewsArticle wraps in new Date(), so compare timestamps
        if (row.published_at) {
          expect(article.publishedAt?.getTime()).toBe(new Date(row.published_at).getTime());
        } else {
          expect(article.publishedAt).toBeNull();
        }
        expect(article.createdAt.getTime()).toBe(new Date(row.created_at).getTime());
        expect(article.updatedAt.getTime()).toBe(new Date(row.updated_at).getTime());
      }),
      { numRuns: 100 }
    );
  });

  it("rowToNewsArticleSummary preserves all fields except bodyContent", () => {
    fc.assert(
      fc.property(arbNewsArticleRow, (row) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { body_content, ...summaryRow } = row;
        const summary = rowToNewsArticleSummary(summaryRow);

        expect(summary.id).toBe(row.id);
        expect(summary.title).toBe(row.title);
        expect(summary.slug).toBe(row.slug);
        expect(summary.articleType).toBe(row.article_type);
        expect(summary.heroImageUrl).toBe(row.hero_image_url);
        expect(summary.summary).toBe(row.summary);
        expect(summary.tags).toEqual(row.tags);
        expect(summary.attribution).toBe(row.attribution);
        expect(summary.sourceUrl).toBe(row.source_url);
        expect(summary.sourcePlatform).toBe(row.source_platform);
        expect(summary.isPublished).toBe(row.is_published);
        expect(summary.isFeatured).toBe(row.is_featured);
        expect(summary.featuredOrder).toBe(row.featured_order);

        if (row.published_at) {
          expect(summary.publishedAt?.getTime()).toBe(new Date(row.published_at).getTime());
        } else {
          expect(summary.publishedAt).toBeNull();
        }
        expect(summary.createdAt.getTime()).toBe(new Date(row.created_at).getTime());
        expect(summary.updatedAt.getTime()).toBe(new Date(row.updated_at).getTime());

        // Verify bodyContent is NOT present on the summary type
        expect("bodyContent" in summary).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("articleType is always a valid NewsArticleType", () => {
    fc.assert(
      fc.property(arbNewsArticleRow, (row) => {
        const article = rowToNewsArticle(row);
        expect(ARTICLE_TYPES).toContain(article.articleType);
      }),
      { numRuns: 100 }
    );
  });

  it("sourcePlatform is null or a valid SourcePlatform", () => {
    fc.assert(
      fc.property(arbNewsArticleRow, (row) => {
        const article = rowToNewsArticle(row);
        if (article.sourcePlatform !== null) {
          expect(SOURCE_PLATFORMS).toContain(article.sourcePlatform);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("tags is always an array", () => {
    fc.assert(
      fc.property(arbNewsArticleRow, (row) => {
        const article = rowToNewsArticle(row);
        expect(Array.isArray(article.tags)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
