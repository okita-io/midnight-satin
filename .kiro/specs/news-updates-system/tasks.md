# Implementation Plan: News and Updates System

## Overview

Add a News/Updates system to Midnight Satin: a `news_articles` database table, content-fetching functions, a "THE LATEST" section on The Boudoir home page, article detail and archive pages, and a fifth "Updates" navigation tab. Implementation follows existing patterns (ISR 60s, server components, `MetadataPills` reuse, Reading Room typography). Property-based tests use `fast-check`.

## Tasks

- [x] 1. Database schema, types, and seed data
  - [x] 1.1 Add `news_articles` table to `src/lib/db/schema.sql`
    - Add CREATE TABLE with all columns: id, title, slug, article_type (CHECK constraint), hero_image_url, summary, body_content, tags, attribution, source_url, source_platform (CHECK constraint), is_published, is_featured, featured_order, published_at, created_at, updated_at
    - Add indexes: published_at DESC, article_type, is_featured (partial), slug
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Add TypeScript types to `src/lib/db/types.ts`
    - Add `NewsArticleType` union type: `'editorial' | 'campaign' | 'ranking' | 'popularity' | 'announcement'`
    - Add `SourcePlatform` union type: `'tiktok' | 'instagram' | 'x' | 'youtube' | 'facebook'`
    - Add `NewsArticle` interface with all fields, `tags: string[]` matching Novel `genreTags` pattern
    - Add `NewsArticleSummary` type as `Omit<NewsArticle, 'bodyContent'>`
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 1.3 Create seed data file `src/lib/db/seed-news.sql`
    - At least 5 seed articles covering all 5 article types (editorial, campaign, ranking, popularity, announcement)
    - At least 2 articles marked as featured with `featured_order` set
    - At least 1 campaign article with `source_url` and `source_platform` populated
    - Tags demonstrating variety: "Campaign", "Rankings", "New Release", "Bonus Credits", "Social", "Editor's Pick", "Weekly Update", "Welcome"
    - Each article has title, hero_image_url (placeholder), summary, body_content, tags, attribution
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 2. Content fetching functions and helpers
  - [x] 2.1 Add news row mapping and attribution helper to `src/lib/content.ts`
    - Add `NewsArticleRow` interface (snake_case DB row)
    - Add `rowToNewsArticle(row)` and `rowToNewsArticleSummary(row)` functions following existing `rowToNovel` pattern
    - Add `getNewsAttribution(article)` helper: "From the Editor" for editorial/announcement, "Staff" for ranking/popularity, custom or "Staff" for campaign
    - _Requirements: 1.3, 8.1, 8.2, 8.3_

  - [x] 2.2 Write property test: row mapping round-trip (Property 1)
    - **Property 1: News article row mapping round-trip**
    - Generate random NewsArticle objects with fast-check, convert to row representation and back via `rowToNewsArticle`, assert equivalence
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test: attribution logic correctness (Property 6)
    - **Property 6: Attribution logic correctness**
    - Generate random article types and attribution strings, verify `getNewsAttribution` returns correct value per rules
    - **Validates: Requirements 8.1, 8.2, 8.3, 11.4**

  - [x] 2.4 Add `getLatestNewsArticles(limit)` to `src/lib/content.ts`
    - Query `news_articles` WHERE `is_published = true` ORDER BY `published_at DESC` LIMIT `$limit`
    - Return `NewsArticleSummary[]` (exclude body_content)
    - Wrap in try/catch returning empty array on failure
    - _Requirements: 2.1, 2.5_

  - [x] 2.5 Add `getFeaturedNewsArticles(limit)` to `src/lib/content.ts`
    - Query WHERE `is_published = true AND is_featured = true` ORDER BY `featured_order ASC NULLS LAST` LIMIT `$limit`
    - Return `NewsArticleSummary[]`
    - _Requirements: 2.2, 2.5_

  - [x] 2.6 Add `getNewsArticle(slug)` to `src/lib/content.ts`
    - Query WHERE `slug = $slug AND is_published = true`
    - Return `NewsArticle | null`
    - _Requirements: 2.3, 2.5_

  - [x] 2.7 Add `getNewsArchive(cursor?, limit?)` to `src/lib/content.ts`
    - Cursor-based pagination using `published_at` ISO timestamp
    - WHERE `published_at < $cursor` (if cursor provided) AND `is_published = true` ORDER BY `published_at DESC` LIMIT `$limit + 1`
    - If rows > limit, pop last and set `nextCursor`
    - Return `{ articles: NewsArticleSummary[]; nextCursor: string | null }`
    - _Requirements: 2.4, 9.2, 9.3_

  - [ ]* 2.8 Write property test: latest articles published and ordered (Property 2)
    - **Property 2: Latest articles are published and ordered**
    - Verify `getLatestNewsArticles` returns only published articles in descending `published_at` order within limit
    - **Validates: Requirements 2.1, 2.5**

  - [ ]* 2.9 Write property test: featured articles published, featured, and ordered (Property 3)
    - **Property 3: Featured articles are published, featured, and ordered**
    - Verify `getFeaturedNewsArticles` returns only published+featured articles ordered by `featured_order`
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 2.10 Write property test: get article by slug (Property 4)
    - **Property 4: Get article by slug returns correct result**
    - Generate random articles with random slugs and published states, verify correct article or null
    - **Validates: Requirements 2.3, 2.5**

  - [ ]* 2.11 Write property test: archive pagination correctness (Property 5)
    - **Property 5: Archive pagination correctness**
    - Generate random published article sets, paginate through all pages, verify no duplicates, no gaps, correct ordering
    - **Validates: Requirements 2.4, 9.2, 9.3**

- [ ] 3. Navigation helpers and navigation bar update
  - [ ] 3.1 Add path helpers to `src/lib/navigation.ts`
    - Add `newsArchivePath()` returning `"/updates"`
    - Add `newsArticlePath(slug)` returning `/updates/${encodeURIComponent(slug)}`
    - _Requirements: 4.4, 6.1, 9.1, 10.4_

  - [ ]* 3.2 Write property test: navigation path construction (Property 9)
    - **Property 9: Navigation path construction**
    - Generate random slug strings, verify `newsArticlePath` produces `/updates/{encodedSlug}` and `newsArchivePath()` returns `"/updates"`
    - **Validates: Requirements 4.4, 6.1, 9.1, 10.4**

  - [ ] 3.3 Add "Updates" tab to `src/app/_components/navigation-bar.tsx`
    - Extend `NavTab` type to include `"updates"`
    - Add tab `{ id: "updates", href: "/updates", label: "Updates", icon: "newspaper" }` between Vault and Profile (index 3)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 4. Checkpoint — Verify data layer and navigation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. NewsArticleCard component
  - [ ] 5.1 Create `src/app/_components/news-article-card.tsx`
    - Accept `NewsArticleSummary` and optional `className` props
    - Render: hero image (16:9 aspect ratio with fallback placeholder), title (Playfair Display italic bold), attribution via `getNewsAttribution` (Marcellus, `text-text-muted`), 2-line summary (Literata, `line-clamp-2`), tags via `MetadataPills`
    - Gold border (`border-primary/40`), `.card` background, `.overlay-sheen` hover, `card-depth` shadow
    - Link to `/updates/[slug]` via `newsArticlePath`
    - Mobile: ~280px width for horizontal scroll; tablet/desktop: fills grid cell
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3, 5.4, 7.1, 8.4, 8.5_

  - [ ]* 5.2 Write property test: card renders all required fields (Property 7)
    - **Property 7: News article card renders all required fields**
    - Generate random `NewsArticleSummary` objects, render `NewsArticleCard`, verify output contains title, attribution, summary, tags, and link to `/updates/{slug}`
    - **Validates: Requirements 4.1, 4.4, 5.4, 8.4**

- [ ] 6. TheLatestSection and Boudoir integration
  - [ ] 6.1 Create `src/app/_components/the-latest-section.tsx`
    - Server component accepting `NewsArticleSummary[]`
    - Section header "THE LATEST" in Cinzel uppercase with tracking matching `HighSocietySection`
    - Up to 3 articles displayed as `NewsArticleCard` components
    - Mobile: horizontal scroll with `no-scrollbar`; tablet: 2-col grid; desktop: 3-col grid
    - "View All" link to `/updates` via `newsArchivePath`
    - Return `null` when `articles.length === 0`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 14.1, 14.2, 14.3_

  - [ ] 6.2 Integrate TheLatestSection into `src/app/page.tsx`
    - Import and call `getFeaturedNewsArticles(3)` (falling back to `getLatestNewsArticles(3)`) in the data fetch
    - Add `<TheLatestSection>` between `<HeroCarousel>` and `<CurrentAffairsSection>`
    - Wrap in try/catch to gracefully handle DB errors (empty array fallback)
    - _Requirements: 3.1, 3.5_

- [ ] 7. Article detail page
  - [ ] 7.1 Create `src/app/updates/[slug]/page.tsx`
    - Server component with `export const revalidate = 60` (ISR)
    - Fetch article via `getNewsArticle(slug)`, call `notFound()` if null
    - Parallax hero layout: full-width hero image with gradient fade to void, title overlay (Playfair Display italic), attribution line via `getNewsAttribution`, `MetadataPills` for tags
    - Summary as italic lead paragraph (Literata) with ornamental divider
    - Body content with Reading Room typography: Literata 18px, 1.6 line-height, justified, 24px margins, `drop-cap` on first paragraph, `reading-max-width` (720px)
    - For campaign articles with `source_url`: "Visit Campaign" `btn-gold` button opening in new tab
    - Source platform label/icon near attribution when applicable
    - Back button navigating to previous page or `/`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.2, 7.3, 12.3, 12.4, 14.4_

  - [ ]* 7.2 Write property test: campaign article CTA and platform (Property 8)
    - **Property 8: Campaign article detail shows CTA and platform**
    - Generate random campaign and non-campaign articles, verify "Visit Campaign" CTA presence/absence and platform display
    - **Validates: Requirements 6.7, 6.9, 12.3, 12.4**

- [ ] 8. News archive page
  - [ ] 8.1 Create `src/app/updates/page.tsx`
    - Server component with `export const revalidate = 60` (ISR)
    - Page header "THE GAZETTE" in Cinzel uppercase gold with tracking
    - Fetch initial articles via `getNewsArchive(undefined, 12)`
    - Display articles using `NewsArticleCard` in `responsive-grid-1-2-3` layout
    - Client component for "Load More" button that fetches next page via cursor
    - Include `<NavigationBar activeTab="updates" />`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 14.1, 14.2, 14.3_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using `fast-check` with 100 iterations minimum
- The existing `MetadataPills` component is reused for tag rendering — no new tag component needed
- All pages use ISR with 60s revalidation matching existing app patterns
- Requirement 11 (auto-generated content via cron/agent) is a backend automation concern and is not included as a coding task here — the data model and fetching functions support it
