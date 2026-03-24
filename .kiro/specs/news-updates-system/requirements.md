# Requirements: News and Updates System

## Overview

Introduce a News/Updates system to the Midnight Satin app that surfaces editorial content, social media campaign promotions, and auto-generated ranking/popularity articles on The Boudoir (home page). Articles follow the same reading experience as novels, with a dedicated archive page and navigation tab.

## Requirement 1: News Article Data Model

**User Story:** As a developer, I need a database table and TypeScript types for news articles so the system can store and retrieve structured article content.

**Acceptance Criteria:**
- A `news_articles` table exists with columns: `id` (UUID PK), `title` (TEXT NOT NULL), `slug` (TEXT UNIQUE NOT NULL), `article_type` (TEXT NOT NULL with CHECK constraint for editorial/campaign/ranking/popularity/announcement), `hero_image_url` (TEXT), `summary` (TEXT NOT NULL), `body_content` (TEXT NOT NULL), `tags` (TEXT[] DEFAULT '{}'), `attribution` (TEXT NOT NULL), `source_url` (TEXT), `source_platform` (TEXT), `is_published` (BOOLEAN DEFAULT FALSE), `is_featured` (BOOLEAN DEFAULT FALSE), `featured_order` (INT), `published_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW())
- Indexes on `published_at DESC`, `article_type`, and `is_featured`
- A `NewsArticle` TypeScript interface in `src/lib/db/types.ts` with `tags: string[]` matching Novel `genreTags` pattern
- A `NewsArticleType` union type: `'editorial' | 'campaign' | 'ranking' | 'popularity' | 'announcement'`
- A `NewsArticleSummary` type for list views omitting `body_content`

## Requirement 2: Content Fetching Functions

**User Story:** As a developer, I need data-fetching functions for news articles so pages can query articles by type, recency, and feature status.

**Acceptance Criteria:**
- `getLatestNewsArticles(limit)` returns the most recent published articles ordered by `published_at DESC`
- `getFeaturedNewsArticles(limit)` returns featured published articles ordered by `featured_order`
- `getNewsArticle(slug)` returns a single article by slug, or null
- `getNewsArchive(cursor?, limit?)` returns paginated published articles with cursor-based pagination
- All functions only return articles where `is_published = true`

## Requirement 3: Boudoir News Section

**User Story:** As a reader, I want to see the latest news and updates on the home page so I stay informed about campaigns, rankings, and announcements.

**Acceptance Criteria:**
- A "THE LATEST" section appears on The Boudoir between the Hero Carousel and Current Affairs sections
- The section header uses Cinzel font, uppercase, with tracking matching existing section headers
- Up to 3 featured or recent news articles are displayed as horizontally scrollable cards on mobile, or a responsive grid on tablet/desktop
- The section includes a "View All" link navigating to the news archive at `/updates`
- The section uses ISR with 60s revalidation matching the existing page strategy
- When no articles exist, the section is hidden entirely

## Requirement 4: News Article Card Design

**User Story:** As a reader, I want news article cards to be visually distinct from novel cards so I can quickly identify news content on the home page.

**Acceptance Criteria:**
- Each article card displays: hero image (16:9 aspect ratio), title (Playfair Display, italic, bold), attribution line (Marcellus, muted text), truncated summary (2 lines max, Literata), and tags
- Cards have a 1px gold border (`border-primary/40`) to visually distinguish them from novel cards
- Cards use the standard surface background, card-depth shadow, and gold-sheen hover overlay matching existing `.card` styles
- Tapping a card navigates to the article detail page at `/updates/[slug]`
- Cards follow mobile-first responsive sizing: ~280px width on mobile horizontal scroll, filling grid cells on tablet/desktop

## Requirement 5: News Article Tags — Genre Tag Styling Parity

**User Story:** As a reader, I want news article tags to look identical to novel genre tags so the visual language is consistent across the app.

**Acceptance Criteria:**
- News articles have a `tags` field (TEXT[] in DB, `string[]` in TypeScript) analogous to the Novel `genreTags` field
- Tags are rendered using the exact same styling as novel genre tags: `px-3 py-1 text-xs tracking-wider uppercase border border-primary/60 text-primary rounded-sm bg-void/50 backdrop-blur-sm`
- The same reusable component or CSS classes used for novel genre tags are reused for news article tags — no duplicate styling
- Tags appear on article cards on The Boudoir home page (below the summary or above the attribution)
- Tags appear on the article detail view in the same position as genre tags on the novel detail page (below the hero/title area)
- Example tags: "Campaign", "Rankings", "New Release", "Bonus Credits", "Social", "Editor's Pick", "Weekly Update"

## Requirement 6: Article Detail View

**User Story:** As a reader, I want to tap a news article and read it in the same immersive format as a novel so the experience feels cohesive.

**Acceptance Criteria:**
- Article detail page lives at `/updates/[slug]`
- The page uses a parallax hero layout matching the novel detail page: full-width hero image with gradient fade to void, title overlay in Playfair Display italic, attribution line below title
- Tags are displayed below the title/attribution area using the same pill styling as novel genre tags (Requirement 5)
- The summary appears as an italic lead paragraph before the body content, with a visual separator (ornamental divider matching Reading Room chapter breaks)
- Body content renders with Reading Room typography: Literata 18px, 1.6 line-height, justified text, 24px margins, drop-cap on first paragraph
- A back button navigates to the previous page or The Boudoir
- For campaign articles with a `source_url`, a "Visit Campaign" CTA button appears styled as `btn-gold`
- The page uses ISR with 60s revalidation
- Social media source platform is indicated with an icon or label when applicable

## Requirement 7: Summary / Read-More Behavior

**User Story:** As a reader, I want a summary preview of news articles that I can expand, matching the novel synopsis experience.

**Acceptance Criteria:**
- On article cards (Boudoir), the summary is truncated to 2 lines with CSS line-clamp
- On the article detail page, the summary appears in full as an italic lead paragraph
- The summary field is required (NOT NULL) and serves as the article's synopsis equivalent

## Requirement 8: Author Attribution Logic

**User Story:** As a reader, I want to see contextual attribution on news articles so I know whether content is editorial or automated.

**Acceptance Criteria:**
- Articles of type `editorial` or `announcement` display attribution as "From the Editor"
- Articles of type `ranking` or `popularity` display attribution as "Staff"
- Articles of type `campaign` display attribution as "Staff" by default, or a custom attribution if provided
- Attribution appears on both the article card and the article detail view
- Attribution text uses Marcellus font, muted color (`text-text-muted`), matching the author name styling on novel cards

## Requirement 9: News Archive Page

**User Story:** As a reader, I want to browse all past news articles in an archive so I can catch up on updates I missed.

**Acceptance Criteria:**
- The archive page lives at `/updates`
- Articles are displayed in reverse chronological order (newest first)
- The page uses cursor-based pagination with a "Load More" button
- Each article in the archive uses the same card component as The Boudoir news section
- The page header reads "THE GAZETTE" in Cinzel uppercase with gold tracking
- The page uses ISR with 60s revalidation
- The archive page includes the bottom navigation bar with the "Updates" tab active

## Requirement 10: Navigation Bar — Updates Tab

**User Story:** As a reader, I want a dedicated navigation tab for news/updates so I can quickly access the archive from anywhere in the app.

**Acceptance Criteria:**
- A fifth tab is added to the bottom navigation bar labeled "Updates"
- The tab uses the `newspaper` Material Symbols Outlined icon
- The tab is positioned between "Vault" and "Profile": Boudoir, Library, Vault, Updates, Profile
- The tab links to `/updates` (the news archive page)
- Active state matches existing tabs: gold icon with glow, gold text, active indicator dot
- The `NavTab` type is extended to include `"updates"`

## Requirement 11: Auto-Updated Content

**User Story:** As a platform operator, I want ranking and popularity articles to be auto-generated so the news section stays fresh without manual intervention.

**Acceptance Criteria:**
- A content generation mechanism (agent/cron/API route) can create or update articles of type `ranking` and `popularity`
- Ranking articles aggregate character endorsement counts and author follower counts from existing database tables
- Popularity articles aggregate novel rating counts and reading progress data
- Auto-generated articles use "Staff" attribution
- The system supports a target update interval (e.g., daily)
- Auto-generated articles include relevant tags (e.g., "Rankings", "Weekly Update", "Trending")

## Requirement 12: Campaign Articles with Social Media Links

**User Story:** As a platform operator, I want to create campaign articles that link to social media posts so readers can engage with promotions for bonus credits.

**Acceptance Criteria:**
- Campaign articles have a `source_url` field for the external social media link
- Campaign articles have a `source_platform` field indicating the platform (tiktok, instagram, x, youtube, facebook)
- On the article detail view, a "Visit Campaign" button styled as `btn-gold` links to the `source_url` in a new tab
- The source platform is displayed as a label or icon near the attribution
- Campaign articles include relevant tags (e.g., "Campaign", "Bonus Credits", "Social")

## Requirement 13: Seed Data

**User Story:** As a developer, I need sample news articles in the database so the UI can be developed and tested with realistic content.

**Acceptance Criteria:**
- At least 5 seed articles are created covering all article types: editorial, campaign, ranking, popularity, announcement
- Each seed article has a title, hero image URL (placeholder), summary, body content, tags, and appropriate attribution
- At least 2 articles are marked as featured with `featured_order` set
- Seed data includes at least one campaign article with `source_url` and `source_platform` populated
- Tags on seed articles demonstrate variety: "Campaign", "Rankings", "New Release", "Bonus Credits", "Social", "Editor's Pick", "Weekly Update", "Welcome"

## Requirement 14: Responsive Layout

**User Story:** As a reader on any device, I want the news section and archive to adapt to my screen size following the app's responsive patterns.

**Acceptance Criteria:**
- On mobile: news cards scroll horizontally in the Boudoir section; archive displays as a single-column list
- On tablet (md: 768px+): Boudoir shows a 2-column grid; archive shows a 2-column grid
- On desktop (lg: 1024px+): Boudoir shows a 3-column grid; archive shows a 3-column grid
- Article detail page uses `reading-max-width` (720px) for body content, matching the Reading Room
- All layouts follow the existing mobile-first responsive patterns in `globals.css`
