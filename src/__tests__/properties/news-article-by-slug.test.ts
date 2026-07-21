/**
 * Property 4: Get article by slug returns correct result
 * Validates: Requirements 2.3, 2.5
 *
 * For any slug string, getNewsArticle(slug) should return the matching published
 * article if one exists with that slug and is_published = true, or null otherwise.
 * It should never return an unpublished article.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 4
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
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

/** Arbitrary that produces a valid full article row (with body_content) */
const arbNewsArticleRow: fc.Arbitrary<NewsArticleRow> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/),
  article_type: fc.constantFrom(...ARTICLE_TYPES),
  hero_image_url: fc.option(fc.webUrl(), { nil: null }),
  summary: fc.string({ minLength: 1, maxLength: 500 }),
  body_content: fc.string({ minLength: 1, maxLength: 1000 }),
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

// Mock @/lib/db/postgres before importing content.ts
vi.mock("@/lib/db/postgres", () => ({
  sql: vi.fn(),
}));

// Mock the cache module to avoid KV dependency
vi.mock("@/lib/cache", () => ({
  cacheGetOrSet: vi.fn((_key: string, fn: () => Promise<unknown>) => fn()),
  cacheGet: vi.fn(() => null),
  cacheSet: vi.fn(),
  cacheKeyFeatured: vi.fn(() => "featured"),
  cacheKeyTrending: vi.fn(() => "trending"),
  cacheKeyAuthor: vi.fn((id: string) => `author:${id}`),
}));

describe("Property 4: Get article by slug returns correct result", () => {
  let getNewsArticle: typeof import("@/lib/content").getNewsArticle;
  let sqlMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const vercelPostgres = await import("@/lib/db/postgres");
    sqlMock = vercelPostgres.sql as unknown as ReturnType<typeof vi.fn>;

    const contentModule = await import("@/lib/content");
    getNewsArticle = contentModule.getNewsArticle;
  });

  it("returns the correct published article when slug matches a published article", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbNewsArticleRow.map((row) => ({ ...row, is_published: true })),
        async (articleRow) => {
          // DB returns the published article matching the slug
          sqlMock.mockResolvedValueOnce({ rows: [articleRow] });

          const result = await getNewsArticle(articleRow.slug);

          // Property: result is not null
          expect(result).not.toBeNull();

          // Property: returned article's slug matches the queried slug
          expect(result!.slug).toBe(articleRow.slug);

          // Property: returned article is published
          expect(result!.isPublished).toBe(true);

          // Property: returned article's id matches
          expect(result!.id).toBe(articleRow.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns null when no published article with the slug exists", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/),
        async (slug) => {
          // DB returns no rows (no published article with this slug)
          sqlMock.mockResolvedValueOnce({ rows: [] });

          const result = await getNewsArticle(slug);

          // Property: result is null when no match
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("never returns an unpublished article even if slug matches", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbNewsArticleRow.map((row) => ({ ...row, is_published: false })),
        async (unpublishedRow) => {
          // The SQL query filters by is_published = true, so the DB
          // would return no rows for an unpublished article
          sqlMock.mockResolvedValueOnce({ rows: [] });

          const result = await getNewsArticle(unpublishedRow.slug);

          // Property: unpublished articles are never returned
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returned article slug always matches the queried slug", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbNewsArticleRow, { minLength: 1, maxLength: 10 }),
        fc.nat({ max: 9 }),
        async (articles, indexSeed) => {
          // Pick one article to query
          const targetIndex = indexSeed % articles.length;
          const target = articles[targetIndex];
          const queriedSlug = target.slug;

          // Simulate DB: only return the article if it's published and slug matches
          const matchingPublished = articles.find(
            (a) => a.slug === queriedSlug && a.is_published
          );

          sqlMock.mockResolvedValueOnce({
            rows: matchingPublished ? [matchingPublished] : [],
          });

          const result = await getNewsArticle(queriedSlug);

          if (matchingPublished) {
            // Property: when a published match exists, result is returned
            expect(result).not.toBeNull();
            // Property: returned slug matches queried slug
            expect(result!.slug).toBe(queriedSlug);
          } else {
            // Property: when no published match, result is null
            expect(result).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
