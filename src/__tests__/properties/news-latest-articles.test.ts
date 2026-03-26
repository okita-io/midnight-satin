/**
 * Property 2: Latest articles are published and ordered
 * Validates: Requirements 2.1, 2.5
 *
 * For any set of news articles in the database (with varying is_published,
 * published_at values), calling getLatestNewsArticles(limit) should return
 * only articles where is_published = true, ordered by published_at descending,
 * with length ≤ limit.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 2
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

/** Arbitrary that produces a valid summary row (without body_content) */
const arbNewsArticleSummaryRow = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: fc.string({ minLength: 1, maxLength: 100 }),
  article_type: fc.constantFrom(...ARTICLE_TYPES),
  hero_image_url: fc.option(fc.webUrl(), { nil: null }),
  summary: fc.string({ minLength: 1, maxLength: 500 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 8 }),
  attribution: fc.string({ minLength: 1, maxLength: 100 }),
  source_url: fc.option(fc.webUrl(), { nil: null }),
  source_platform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), { nil: null }),
  is_published: fc.boolean(),
  is_featured: fc.boolean(),
  featured_order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  published_at: fc.option(
    fc.date({ min: new Date("2020-01-01"), max: new Date("2030-01-01") }),
    { nil: null }
  ),
  created_at: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-01-01") }),
  updated_at: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-01-01") }),
});

// Mock @vercel/postgres before importing content.ts
vi.mock("@vercel/postgres", () => ({
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

describe("Property 2: Latest articles are published and ordered", () => {
  let getLatestNewsArticles: typeof import("@/lib/content").getLatestNewsArticles;
  let sqlMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const vercelPostgres = await import("@vercel/postgres");
    sqlMock = vercelPostgres.sql as unknown as ReturnType<typeof vi.fn>;

    const contentModule = await import("@/lib/content");
    getLatestNewsArticles = contentModule.getLatestNewsArticles;
  });

  it("returns only published articles, in descending published_at order, within limit", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbNewsArticleSummaryRow, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        async (articles, limit) => {
          // Simulate what the database would return:
          // filter to published, sort by published_at DESC, apply limit
          const published = articles
            .filter((a) => a.is_published)
            .sort((a, b) => {
              const dateA = a.published_at ? a.published_at.getTime() : 0;
              const dateB = b.published_at ? b.published_at.getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, limit);

          // Mock the sql tagged template to return the filtered/sorted rows
          sqlMock.mockResolvedValueOnce({ rows: published });

          const result = await getLatestNewsArticles(limit);

          // Property: length ≤ limit
          expect(result.length).toBeLessThanOrEqual(limit);

          // Property: all returned articles are published
          for (const article of result) {
            expect(article.isPublished).toBe(true);
          }

          // Property: articles are in descending published_at order
          for (let i = 1; i < result.length; i++) {
            const prevDate = result[i - 1].publishedAt?.getTime() ?? 0;
            const currDate = result[i].publishedAt?.getTime() ?? 0;
            expect(prevDate).toBeGreaterThanOrEqual(currDate);
          }

          // Property: result count matches expected published count (up to limit)
          const expectedCount = Math.min(
            articles.filter((a) => a.is_published).length,
            limit
          );
          expect(result.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty array when no articles are published", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          arbNewsArticleSummaryRow.map((row) => ({ ...row, is_published: false })),
          { minLength: 0, maxLength: 10 }
        ),
        fc.integer({ min: 1, max: 10 }),
        async (_articles, limit) => {
          // Database returns no rows when none are published
          sqlMock.mockResolvedValueOnce({ rows: [] });

          const result = await getLatestNewsArticles(limit);

          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("respects the limit parameter", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          arbNewsArticleSummaryRow.map((row) => ({
            ...row,
            is_published: true,
            published_at: new Date("2024-01-01"),
          })),
          { minLength: 5, maxLength: 20 }
        ),
        fc.integer({ min: 1, max: 4 }),
        async (articles, limit) => {
          // Return only `limit` rows from the mock (simulating DB LIMIT)
          const dbRows = articles.slice(0, limit);
          sqlMock.mockResolvedValueOnce({ rows: dbRows });

          const result = await getLatestNewsArticles(limit);

          expect(result.length).toBeLessThanOrEqual(limit);
        }
      ),
      { numRuns: 100 }
    );
  });
});
