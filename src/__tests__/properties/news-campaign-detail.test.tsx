/**
 * Property 8: Campaign article detail shows CTA and platform
 * Validates: Requirements 6.7, 6.9, 12.3, 12.4
 *
 * For any news article of type `campaign` with a non-null `source_url`, the
 * article detail view should render a "Visit Campaign" link pointing to that
 * `source_url`. When `source_platform` is also non-null, the platform name
 * should appear in the rendered output. For non-campaign articles, no
 * "Visit Campaign" CTA should be present.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 8
 */

// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import { CampaignDetail } from "@/app/_components/campaign-detail";
import type { NewsArticleType, SourcePlatform } from "@/lib/db/types";

const ARTICLE_TYPES: NewsArticleType[] = [
  "editorial",
  "campaign",
  "ranking",
  "popularity",
  "announcement",
];

const NON_CAMPAIGN_TYPES: NewsArticleType[] = [
  "editorial",
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

/** Expected display labels for each platform */
const PLATFORM_LABELS: Record<SourcePlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
  youtube: "YouTube",
  facebook: "Facebook",
};

afterEach(() => {
  cleanup();
});

describe("Property 8: Campaign article detail shows CTA and platform", () => {
  it("campaign articles with non-null sourceUrl render 'Visit Campaign' link pointing to sourceUrl", () => {
    /**
     * **Validates: Requirements 6.7, 12.3**
     */
    fc.assert(
      fc.property(
        fc.record({
          articleType: fc.constant("campaign" as NewsArticleType),
          sourceUrl: fc.webUrl(),
          sourcePlatform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), {
            nil: null,
          }),
        }),
        (article) => {
          const { container, unmount } = render(
            <CampaignDetail article={article} />
          );

          const link = container.querySelector('a');
          expect(link).not.toBeNull();
          expect(link!.textContent).toContain("Visit Campaign");
          expect(link!.getAttribute("href")).toBe(article.sourceUrl);
          expect(link!.getAttribute("target")).toBe("_blank");
          expect(link!.getAttribute("rel")).toContain("noopener");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("campaign articles with null sourceUrl do NOT render 'Visit Campaign'", () => {
    /**
     * **Validates: Requirements 6.7, 12.3**
     */
    fc.assert(
      fc.property(
        fc.record({
          articleType: fc.constant("campaign" as NewsArticleType),
          sourceUrl: fc.constant(null as string | null),
          sourcePlatform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), {
            nil: null,
          }),
        }),
        (article) => {
          const { container, unmount } = render(
            <CampaignDetail article={article} />
          );

          const text = container.textContent ?? "";
          expect(text).not.toContain("Visit Campaign");

          const link = container.querySelector('a');
          expect(link).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("non-campaign articles never render 'Visit Campaign' CTA", () => {
    /**
     * **Validates: Requirements 6.7, 12.3**
     */
    fc.assert(
      fc.property(
        fc.record({
          articleType: fc.constantFrom(...NON_CAMPAIGN_TYPES),
          sourceUrl: fc.option(fc.webUrl(), { nil: null }),
          sourcePlatform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), {
            nil: null,
          }),
        }),
        (article) => {
          const { container, unmount } = render(
            <CampaignDetail article={article} />
          );

          const text = container.textContent ?? "";
          expect(text).not.toContain("Visit Campaign");

          const link = container.querySelector('a');
          expect(link).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when sourcePlatform is set, the platform display name appears in the output", () => {
    /**
     * **Validates: Requirements 6.9, 12.4**
     */
    fc.assert(
      fc.property(
        fc.record({
          articleType: fc.constantFrom(...ARTICLE_TYPES),
          sourceUrl: fc.option(fc.webUrl(), { nil: null }),
          sourcePlatform: fc.constantFrom(...SOURCE_PLATFORMS),
        }),
        (article) => {
          const { container, unmount } = render(
            <CampaignDetail article={article} />
          );

          const text = container.textContent ?? "";
          const expectedLabel = PLATFORM_LABELS[article.sourcePlatform!];
          expect(text).toContain(expectedLabel);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when sourcePlatform is null, no platform label appears", () => {
    /**
     * **Validates: Requirements 6.9, 12.4**
     */
    fc.assert(
      fc.property(
        fc.record({
          articleType: fc.constantFrom(...ARTICLE_TYPES),
          sourceUrl: fc.option(fc.webUrl(), { nil: null }),
          sourcePlatform: fc.constant(null as SourcePlatform | null),
        }),
        (article) => {
          const { container, unmount } = render(
            <CampaignDetail article={article} />
          );

          const text = container.textContent ?? "";
          for (const label of Object.values(PLATFORM_LABELS)) {
            expect(text).not.toContain(label);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
