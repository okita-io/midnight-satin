# Midnight Satin Component Unification Plan

This document outlines inconsistencies found in the Midnight Satin Next.js app and proposes a unification strategy to create a more cohesive, stable, and maintainable UI component system.
 
## Purpose

The app’s **current UI is in good shape**: screens align with `reference/`, typography and noir–gold language read as intentional, and feature components under `src/app/_components/` are maintainable for what exists today.

This plan exists so **future features** ship faster and stay visually unified. The target is a **small, documented catalog of reusable primitives and patterns** (back navigation, icon treatment, section headings, body copy blocks, actions, loading shells) so contributors **look up or import existing pieces** instead of inventing parallel implementations.

Midnight Satin is a **reading product**: long sessions depend on **typographic calm**. The design system already assigns roles—**display** (novel / display titles), **header** (section labels, nav chrome), **body** (prose, reviews, synopsis), **ui** (buttons, metadata, small caps), **script** (accent moments like empty states)—via Tailwind `font-*` utilities backed by CSS variables in `layout.tsx`. The awkwardness to avoid is **adjacent blocks that should read as one rhythm** (e.g. a section label + helper line + “View all”) mixing **different families or arbitrary size/weight combos** that were chosen ad hoc. The catalog should make the **right font role the default** for each semantic pattern so components sitting next to each other **match by construction**, not by memory.

**Scope:** align implementation with a shared catalog over time. **Not** a wholesale redesign or mandatory rewrite of working screens. **Reference work** (`reference/` HTML and future **Pencil** sources) runs as a **parallel design track** so specs stay easy to edit and consistent before they flow into React.

### Navigation & chrome

| Component | Role | Notes |
|-----------|------|--------|
| **`BackButton` / `BackLink`** | Consistent back/up affordance (icon + optional label, `href` or `router.back`). | Consolidate today’s `arrow_back` scattered implementations + text-only back on reviews. |
| **`Icon` / `MsIcon`** | Single entry for Material Symbols: `name`, `size`, `tone`, `filled`. | Replace ad hoc spans + inline styles over time. |
| **`IconButton`** | Circular or minimal hit target for header/toolbar icons. | Boudoir search/notify, HUD controls, etc. |

### Typography & text blocks

Catalog pieces here exist to keep **one vertical slice of UI** (title + subtitle + action + body) on a **single typographic ladder** so nothing beside it “almost matches.”

| Component | Role | Notes |
|-----------|------|--------|
| **`Text`** (optional primitive) | Variants map to **one** of `font-display` / `font-header` / `font-body` / `font-ui` / `font-script` plus agreed sizes/tracking. | Prefer thin wrapper or `cva`-style variants over raw class strings in new code. |
| **`ScreenTitle` / `PageEyebrow`** | Large screen titles vs small uppercase labels per reference. | Always pair with documented **subtitle** pattern (usually `font-body` or `font-ui` at a fixed step—not arbitrary `text-sm` vs `text-xs` drift). |
| **`DetailSectionHeading`** | Novel detail section titles (muted, uppercase tracking, bottom border). | Four call sites today; ensures **Reviews / Synopsis / Chapters / Cast** share one title treatment. |
| **`BodyBlock` / `ProseSurface`** | Constrained width, comfortable line-height, **`font-body`** for long copy. | Reader chapter text, synopsis, review bodies, news article content—**default reading surface**. |

**Authoritative mapping (align code with `reference/midnight_satin_prd.html` and HTML screens):**

| Semantic role | Tailwind utility | Typical use |
|---------------|------------------|-------------|
| Display / novel titles | `font-display` | Card titles, hero titles, big moments |
| Section / screen labels | `font-header` | “Current Affairs”, nav labels, uppercase tracking bands |
| Body / prose | `font-body` | Synopsis, reviews, chapter content, long descriptions |
| UI / controls / metadata | `font-ui` | Buttons, counts, timestamps, pills, small labels |
| Accent / emotional line | `font-script` | Empty-state headline, decorative quotes—**sparse** so it stays special |

When two elements are **visually grouped** (same card, same section header row, same list row), they should **reuse catalog variants** (or the same documented combo) so **font family does not change line-to-line** unless the design system intentionally contrasts display vs body.

### Actions & inputs

| Component | Role | Notes |
|-----------|------|--------|
| **`Button`** | Primary / secondary / ghost / loading. | CTA in `EmptyState`, forms, modals. |
| **`TextInput` / `SearchField`** | Shared focus ring, sizes. | `search-overlay`, library filter patterns. |
| **`SectionViewAllLink` / `Button`** | Already exists — **promote** and add **`variant`**. | Align `current-affairs`, `the-latest`, `trophy-case`. |

### Media & data display

| Component | Role | Notes |
|-----------|------|--------|
| **`Card`** | Elevated / outlined / hoverable list tiles. | Bridge to `.card` / hover policy. |
| **`Avatar`** | Round / hex author treatments — may wrap **`hexagon-avatar`**. | Single API for “who wrote this”. |
| **`Badge` / `TagChip`** | Genre pills, status chips. | Novel list-expanded tags, metadata. |
| **`StarRow` / `NumericRatingBadge`** | Star visualization variants. | Feed `rating-display`, `review-card`, `novel-card`. |

### Feedback & structure

| Component | Role | Notes |
|-----------|------|--------|
| **`EmptyState`** | Promote existing; optional **variants** (icon, message, CTA). | Already matches design voice. |
| **`Skeleton` / `Shimmer`** | Wrap or alias **`ShimmerPlaceholder`**. | Grid/list placeholders. |
| **`Modal` / `Dialog`** | Focus trap, escape, scroll lock conventions. | Align `SearchOverlay`, `CastGalleryModal`, `AuthPrompt` over time. |

### Discovery for contributors

- **`src/components/ui/README.md`** — short index: “I need a back control → `BackLink`”, “section title on novel → `DetailSectionHeading`”, “prose block → `BodyBlock` / `Text` variant `body`”, plus the **typography matrix** table above (or a link to a `typography.md` snippet).
- Optional later: **`/dev/ui`** route or Storybook — only if the team wants visual browsing; README + reference HTML may be enough initially.

## Gaps and inconsistencies (prioritized backlog)

These are the same underlying observations as before, reframed as **catalog gaps** rather than a judgment on quality.

1. **Novel card** — One file, multiple layout branches; repeated cover + star markup. *Catalog fix:* compose from smaller pieces after `Icon` / star primitives exist.

2. **Icons** — Inline size/color vs classes. *Catalog fix:* `Icon` + tokens.

3. **Responsive / hover** — Good utilities exist; application is uneven. *Catalog fix:* documentation + optional small hook helpers in `lib/responsive` or `lib/ui` for DOM-only behavior.

4. **UI state** — Overlays and toggles are fine locally; risk is **inconsistent focus/escape** as more modals appear. *Catalog fix:* shared `Dialog` primitive.

5. **Interaction polish** — Mix of `active:scale-95`, `group-hover`, custom classes. *Catalog fix:* document preferred patterns per surface (list vs header vs reader).

6. **Loading / errors** — Library catalog leads; other routes may not. *Catalog fix:* adopt `Skeleton` grid where data is fetched on the client.

7. **`className` / refs** — Not universal on components. *Catalog fix:* conventions for primitives only (avoid boiling the ocean on every feature component).

8. **Detail section headings** — Duplicated string. *Catalog fix:* `DetailSectionHeading` — **high ROI, low risk**.

9. **“View all”** — Partially unified. *Catalog fix:* variants on existing `SectionViewAll*`.

10. **Stars** — Three implementations. *Catalog fix:* shared star building blocks.

11. **Back navigation** — Many equivalent UX paths, different markup. *Catalog fix:* **`BackLink` / `BackButton`** — **high leverage for “professional + uniform”** on every new screen.

12. **Typography drift** — Neighboring components use different `font-*` or size/tracking for the same semantic job (e.g. two “secondary” lines one `font-ui` and one `font-body`). *Catalog fix:* README matrix + optional **`Text`** variants; unify **section header rows** and **list row metadata** when migrating those files.

13. **Reference HTML drift** — Multiple static HTML files implement similar regions with **slightly different** structure, spacing, or type scale; hard to batch-edit. *Design fix:* **Pencil-first** editing—shared frames/components in `.pencil` for nav, section headers, cards, reader chrome—then **one unification pass** on HTML (or regenerate) so `reference/` matches Pencil and the **typography matrix** applies across screens.

---

## Existing foundations (reuse, do not duplicate)

- **`src/lib/responsive/`** — viewport + pointer + hover policy; extend here rather than a second device-detection stack.
- **`EmptyState`**, **`ShimmerPlaceholder`**, **`SectionViewAll*`**, **`rating-display`**, **`novel-card`**, **`navigation-bar`** — ship-quality; migration means **wrapping or extracting**, not deleting product logic on day one.
- **`reference/`** — every new catalog primitive should cite which HTML screen it maps to; once Pencil exists, cite **the pencil file / frame** too.

---

## Reference design: HTML + Pencil (unification)

**Goal:** `reference/` stays the contract for engineering, but **editing** happens in **Pencil** (`.pencil`) where shared UI can be **components or linked styles**—easier than hand-editing many HTML files—so mobile/tablet pairs and neighboring blocks stay **visually and typographically consistent**.

### Current inventory (`reference/`)

Static HTML today includes, among others: `midnight_satin_prd.html`, `midnight_satin_home.html`, `midnight_satin_home_tablet.html`, `the_novel_detail.html`, `the_novel_detail_tablet.html`, `the_reading_room.html`, `the_reading_room_tablet.html`, `the_reading_room_with_comments.html`, `the_cast_gallery.html`, `the_cast_gallery_with_endorsements.html`, `the_authors_study.html`, `the_authors_study_tablet.html`, `the_vault_store.html`, `the_library_grid.html`, `the_library_list.html`, `the_library_empty.html`, `the_login.html`, `the_register.html`. **Pencil track started:** `reference/pencil/midnight_satin_home.pencil` (generated artboard + `build-midnight-satin-home-pencil.mjs`). **`reference/pencil/design_system.pen`** — shared component library; backlog checklist lives in [Pencil design system pen — component backlog](#pencil-design-system-pen--component-backlog-from-src-audit) below.

### Target layout (suggested)

- Add **`reference/pencil/`** (or repo root `design/` if you prefer separation from shipped HTML—pick one and document it in AGENTS / Cursor rule).
- **Naming parity:** one `.pencil` per **logical screen family** where it helps, e.g. `midnight_satin_home.pencil` containing **mobile + tablet** artboards, mirroring `midnight_satin_home.html` + `midnight_satin_home_tablet.html`; same idea for novel detail, reading room, author study, library.
- **Shared library:** in Pencil, define **reusable blocks** aligned with the app catalog intent: back row, bottom nav, section title + “View all”, novel card tile, reader HUD strip, empty state, primary button—so unification is **edit once, propagate** before touching HTML/React.
- **PRD:** `midnight_satin_prd.html` stays the **token and type spec**; either a **dedicated `design_system.pen`** (recommended; same JSON schema as `.pen` / `.pencil`) or a pinned page in the main workspace that **does not drift** from PRD numbers (colors, font roles).

### Pencil design system pen — component backlog (from src audit)

**Linear (umbrella task):** [THE-221 — Pencil design_system.pen component library backlog](https://linear.app/theclawffice/issue/THE-221/midnight-satin-pencil-design_systempen-component-library-backlog) (checklist of record remains in this doc).

**Linear child issues (grouped work under THE-221):**

| Issue | Group |
|-------|--------|
| [THE-232 — Foundation (variables)](https://linear.app/theclawffice/issue/THE-232/midnight-satin-pencil-ds-foundation-variables) | Tokens in `design_system.pen` |
| [THE-231 — Typography text blocks](https://linear.app/theclawffice/issue/THE-231/midnight-satin-pencil-ds-typography-text-blocks) | Display, section, body, script, links |
| [THE-230 — Buttons and controls](https://linear.app/theclawffice/issue/THE-230/midnight-satin-pencil-ds-buttons-and-controls) | CTAs, ghost, HUD, stars |
| [THE-229 — Links](https://linear.app/theclawffice/issue/THE-229/midnight-satin-pencil-ds-links) | View-all variants, card-as-link |
| [THE-228 — Icons and indicators](https://linear.app/theclawffice/issue/THE-228/midnight-satin-pencil-ds-icons-and-indicators) | Material scale, badges, rules |
| [THE-227 — Surfaces and layout chrome](https://linear.app/theclawffice/issue/THE-227/midnight-satin-pencil-ds-surfaces-and-layout-chrome) | Cards, modal, bars, progress |
| [THE-226 — Tags and metadata](https://linear.app/theclawffice/issue/THE-226/midnight-satin-pencil-ds-tags-and-metadata) | Genre pills |
| [THE-225 — Navigation composites](https://linear.app/theclawffice/issue/THE-225/midnight-satin-pencil-ds-navigation-composites) | Tab bar, HUD footer, admin nav |
| [THE-224 — Blocks (empty, vault, hero)](https://linear.app/theclawffice/issue/THE-224/midnight-satin-pencil-ds-blocks-empty-vault-hero) | Marketing / empty blocks |
| [THE-223 — Forms](https://linear.app/theclawffice/issue/THE-223/midnight-satin-pencil-ds-forms) | Field + label |
| [THE-222 — Follow-ups (back, news, cast)](https://linear.app/theclawffice/issue/THE-222/midnight-satin-pencil-ds-follow-ups-back-news-cast) | Lower-frequency patterns |

Track these as **`reusable: true`** components in `reference/pencil/design_system.pen`. Cross-reference `src/lib/design-tokens.ts`, `src/app/globals.css`, and the paths in each row. **Check boxes here** as components land in Pencil (and optionally mirror the same names in `src/components/ui/` during the React catalog phases).

#### Foundation

- [ ] **Variables** — mirror PRD colors, radii, shadows, and font role names (`display`, `header`, `body`, `ui`, `script`)

#### Typography — text blocks

- [ ] **Type / Display hero title** — Playfair italic bold, tight leading (hero, large titles)
- [ ] **Type / Section title (Cinzel)** — small, wide letter-spacing, near-white (e.g. `current-affairs-section.tsx`, `high-society-section.tsx`)
- [ ] **Type / Subsection label** — muted uppercase, optional bottom border (`synopsis-section.tsx` “Synopsis”)
- [ ] **Type / UI label** — Marcellus, `text-xs`, uppercase, widened tracking (form labels, `review-card.tsx` meta)
- [ ] **Type / Body default** — Literata, relaxed leading (`review-card.tsx`, long copy)
- [ ] **Type / Script accent** — Pinyon Script, large, gold (`empty-state.tsx`)
- [ ] **Text link / muted → primary** — tertiary links (`login-form.tsx` forgot password, similar)
- [ ] **Text control / Read more** — primary, uppercase, `expand_more` icon (`synopsis-section.tsx`)

#### Buttons and controls

- [ ] **Button / Primary gold** — void text, UI font, uppercase, gold glow (`.btn-gold` in `globals.css`, `auth-prompt.tsx`, `empty-state.tsx`, `login-form.tsx`)
- [ ] **Button / Secondary outline** — gold border + gold text, hover fill (`auth-prompt.tsx` Register)
- [ ] **Button / Follow toggle** — filled primary vs outline “Following” (`follow-button.tsx`)
- [ ] **Button / Icon ghost** — circular hit target, surface/blur, hairline border (`novel-detail-header.tsx`)
- [ ] **Button / HUD icon column** — icon + micro-label, 24↔28 active + gold glow (`reading-room/reading-hud.tsx`; align with `navigation-bar.tsx`)
- [ ] **Button / Segmented chip** — small rounded choice (font size / line height popovers in `reading-hud.tsx`)
- [ ] **Button / The Veil CTA** — dark fill, gold border, optional sheen (`the-veil.tsx`)
- [ ] **Control / Star rating** — display + input variants (`rating-display.tsx`, `review-card.tsx`, `star-rating-input.tsx`)

#### Links

- [ ] **Link / Section view-all (Literata)** — `section-view-all.tsx`
- [ ] **Link / Section view-all (UI uppercase)** — `current-affairs-section.tsx` (treat as **variant** of the above or a second named style in Pencil)
- [ ] **Link / Full-bleed card link** — whole tile tappable (`novel-card.tsx`, `vault-teaser-card.tsx`)

#### Icons and indicators

- [ ] **Icon / Material scale** — 16 / 18 / 24 / 28px + `FILL` 0/1 convention (Material Symbols usage across `src/app/_components/`)
- [ ] **Icon / Notification dot** — accent badge on icon (`boudoir-header.tsx`, comment badge in `reading-hud.tsx`)
- [ ] **Icon / Decorative rule** — short gradient line + center icon (`vault/vault-client.tsx`)

#### Surfaces and layout chrome

- [ ] **Surface / Card** — surface fill, hairline border, card depth, optional gold sheen (`.card`, `.overlay-sheen` in `globals.css`; `novel-card.tsx`, current affairs inner card)
- [ ] **Surface / Review card** — lighter gold border, glassy fill (`review-card.tsx`)
- [ ] **Surface / Modal panel** — bordered surface + gold glow shadow (`auth-prompt.tsx`)
- [ ] **Surface / Form banner** — success (gold border) vs error (accent border) (`login-form.tsx`)
- [ ] **Layout / Gradient header strip** — top fade for overlays (`boudoir-header.tsx`, `novel-detail-header.tsx`, `reading-hud.tsx`)
- [ ] **Layout / Fixed bottom bar** — `#080808`, top border `#1F1F1F`, upward shadow, safe-area padding (`navigation-bar.tsx`, `reading-hud.tsx`)
- [ ] **Layout / Progress bar** — muted track + gold fill with glow (`reading-hud.tsx`, progress on cover in `current-affairs-section.tsx`)

#### Tags and metadata

- [ ] **Tag / Genre pill** — uppercase, bordered, translucent void (`metadata-pills.tsx`)

#### Navigation composites

- [ ] **Nav / Primary tab bar item** — icon + label, active size, glow, optional dot (`navigation-bar.tsx`)
- [ ] **Nav / Reading HUD footer** — progress + multi-column tools (`reading-hud.tsx`, `lib/responsive/constants.ts` footer classes)
- [ ] **Nav / Admin sidebar item** (optional separate artboard) — icon + label, active pill (`admin/layout.tsx`)

#### Blocks

- [ ] **Block / Empty state** — blur halo, icon ring, script headline, optional gold CTA (`empty-state.tsx`)
- [ ] **Block / Vault teaser** — horizontal gradient, copy + diamond icon (`vault-teaser-card.tsx`)
- [ ] **Block / Hero slide** (optional) — layered image + vignette + CTA stack (`hero-carousel.tsx` + reference home HTML)

#### Forms

- [ ] **Field / Text input + label** — h-14, surface-highlight fill, gold focus border (`auth/login/login-form.tsx` and register analogs)

#### Follow-ups (fewer repeats, high polish)

- [ ] **Back control** — icon vs text back patterns (`updates/[slug]/back-button.tsx`, `paperback-page-shell.tsx`, novel/reading headers)
- [ ] **News / campaign row** — `news-article-card.tsx`, `campaign-detail.tsx`
- [ ] **Cast chrome** — portrait frame, endorsement affordances (`cast-gallery-modal.tsx`, `character-portrait.tsx`, `hexagon-avatar.tsx`)

### Workflow (recommended)

1. **Create Pencil files** alongside existing HTML names so diffs and discussion stay traceable.
2. **Unify in Pencil first** — align type scale, section chrome, and spacing across screens that appear in one user session (e.g. home → novel detail → reader).
3. **Export or hand-port** to `reference/*.html` (whatever your Pencil → HTML workflow supports); keep HTML **valid, self-contained** for designers who do not use Pencil and for CI/review.
4. **Update Cursor rule / AGENTS** to say: *implementation matches `reference/` HTML; if HTML and Pencil disagree after a pass, **Pencil wins** until HTML is updated.*

### Cursor / tooling

- **Pencil extension** (e.g. Pencil for Cursor) is the intended editor for `.pen` files; keep binaries or large assets out of git if your team policy prefers **LFS** or a linked design repo—note the choice in this plan when you decide.

---

## Recommended approach

1. **Treat the catalog as additive** — New features import from `src/components/ui/` when a primitive exists; existing screens migrate opportunistically (touch-a-file rule: if you edit a file for a bug/feature, consider swapping one pattern to the catalog).
2. **Start with navigation + typography chrome** — `BackLink`/`BackButton`, `DetailSectionHeading`, `Icon` — because they appear on almost every new route and are easy to verify visually. Publish the **typography matrix** in README as soon as Phase 1 starts so font choices stay consistent **before** a large `Text` primitive exists.
3. **Then actions and feedback** — `Button`, `Skeleton` alias, `Dialog` baseline.
4. **Then denser refactors** — `novel-card` composition, full icon sweep.
5. **Reference track in parallel** — Pencil library + HTML unification feed the **same typography matrix** and catalog primitives; app work should not outrun reference without an explicit exception.

## Implementation roadmap (suggested)

### Phase 0 — Reference: Pencil + HTML unification (design track)

- [ ] Add **`reference/pencil/`** and **naming convention** doc (screen ↔ pencil ↔ HTML ↔ app route)
- [ ] Create **`reference/pencil/design_system.pen`** and implement the [design system pen backlog](#pencil-design-system-pen--component-backlog-from-src-audit) checklist (reusable components + variables)
- [ ] Create **initial `.pen`** files for home + novel detail (mobile + tablet artboards per file where useful)
- [ ] Build **shared components** in Pencil for section headers, nav, primary actions, card tiles—match **PRD type roles** (compose from `design_system.pen` where possible)
- [ ] **Unification pass** on `reference/*.html` to match Pencil (typography, spacing, repeated chrome)
- [ ] Update **`.cursor/rules/midnight-satin-design.mdc`** (or AGENTS) with **source-of-truth order**: Pencil → HTML → implementation

### Phase 1 — Catalog shell + highest-leverage chrome

- [ ] Create `src/components/ui/` + **`README.md` catalog index**
- [ ] `Icon` (Material Symbols wrapper) + migrate `navigation-bar`
- [ ] `DetailSectionHeading`
- [ ] `BackLink` / `BackButton` + migrate 2–3 critical routes (novel header, updates, reviews)
- [ ] Add **typography matrix** to catalog README (and optionally `Text` primitive with 2–3 variants if it speeds adoption)

### Phase 2 — Actions, inputs, surfaces

- [ ] `Button` variants
- [ ] `TextInput` / search field alignment with `search-overlay`
- [ ] `Card` variants tied to existing utilities
- [ ] Promote `ShimmerPlaceholder` as catalog `Skeleton` (re-export or thin wrapper)

### Phase 3 — Dialogs and empty states

- [ ] Shared `Dialog` / modal baseline (focus, escape, scroll lock)
- [ ] `EmptyState` props / variants documented in README

### Phase 4 — Broader migration

- [ ] Icon sweep: reading room, vault, veil, comments, cast gallery
- [ ] `novel-card` internal composition + shared star/badge
- [ ] More list pages use `Skeleton` where loading applies
- [ ] **Typography audit** on high-traffic stacks (Boudoir home bands, library header + catalog, reading room HUD + content) using the matrix; no visual roulette beside long reading surfaces

### Phase 5 — Hardening

- [ ] Accessibility pass on catalog primitives
- [ ] Responsive QA
- [ ] Optional `/dev/ui` or Storybook if desired

---

## Success metrics

- **Discoverability:** README catalog answers “which component do I use?” without asking in chat.
- **Reuse:** New screens use `BackLink`, `Icon`, `DetailSectionHeading` instead of new one-offs.
- **Fewer duplicates:** Grep counts for `arrow_back` implementations and copy-pasted section heading class strings go down over time.
- **Same look and feel:** Visual regression stays minimal (pixel-parity migrations first).
- **Reading rhythm:** Fewer adjacent arbitrary `font-*` / size pairings; grep or review finds **one pattern per semantic role** on polished surfaces.
- **Reference parity:** Pencil and HTML agree on shared patterns; fewer “this screen’s section title is 1px different” surprises when implementing.
- **CSS and markup hygiene:** Fewer one-off hover/focus/loading paths as Issues 3–6 and the catalog absorb repeated patterns; optional checks include grep counts for inline icon sizing and duplicated `@media` blocks.
- **Contributor velocity:** New UI work starts from README + reference HTML rather than rediscovering conventions file by file.

---

## Files to reference

- **Design:** `reference/` HTML screens (especially `reference/midnight_satin_prd.html` for type roles); **`reference/pencil/*.pen`** once added (editable source for unification)
- **Tokens / Tailwind:** `tailwind.config.ts` (`fontFamily.display|header|body|ui|script`), `src/app/layout.tsx` (Next font variables wired to CSS)
- **Feature components:** `src/app/_components/` (and `author/`, `reading-room/`, `profile/` subfolders)
- **Responsive:** `src/lib/responsive/`
- **Back navigation samples:** `novel-detail-header.tsx`, `reading-room/reading-hud.tsx`, `vault/page.tsx`, `author/author-study-header.tsx`, `novel/[novelId]/paperback/paperback-page-shell.tsx`, `updates/[slug]/back-button.tsx`, `novel/[novelId]/reviews/page.tsx`, `cast-gallery-modal.tsx`
- **Section / actions:** `section-view-all.tsx`, `current-affairs-section.tsx`, `the-latest-section.tsx`, `author/trophy-case.tsx`, `players-section.tsx`, `reviews-section.tsx`, `synopsis-section.tsx`, `chapter-list.tsx`
- **Stars / cards:** `rating-display.tsx`, `review-card.tsx`, `novel-card.tsx`, `library-catalog.tsx`

## Design considerations (breakpoints and reading)

**Source of truth:** `reference/midnight_satin_prd.html`, Tailwind `screens` in `tailwind.config.ts`, and `src/lib/responsive/constants.ts` (`BREAKPOINTS`). When breakpoints change, update those together so Tailwind classes, JS helpers, and property tests stay aligned (see **Issue 3** below).

Generic industry ranges (480 / 768 / 1024 / 1280px, etc.) are a sanity check only. Prefer **content-based** tweaks when a layout looks cramped at a width that does not match a tier—then document the exception in CSS or component notes rather than inventing a third breakpoint system.

**Reading product:** Long sessions need typographic calm. Follow the PRD **font roles** (`font-display` / `font-header` / `font-body` / `font-ui` / `font-script`) and the typography matrix earlier in this doc. For fluid type between mobile and tablet, prefer **`clamp()`** or Tailwind steps that match exported reference HTML, instead of stacking many unrelated `min-width` blocks.

**Mobile-first:** Implement from the narrowest reference artboard upward; use `min-width` media queries for larger tiers. Bottom navigation and thumb zones on small screens should stay consistent with `reference/` and existing chrome (`navigation-bar`, reader HUD).

## Issues Identified

### 1. Inconsistent Component Variant Patterns
- **File**: `src/app/_components/novel-card.tsx`
- **Issue**: String `variant` union plus `fill` boolean; `variant="list"` is a wrapper that recursively renders `compact` (mobile) and `list-expanded` (desktop), which complicates the API and extension.
- **Impact**: Complex conditional logic, difficult to extend, potential for prop conflicts

#### Related Components

Coordinate refactors in this order so call sites stay in sync:

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `src/app/_components/novel-card.tsx` | Source of truth: `NovelCard`, `NovelCardData`, all variants. Agent owning the new API implements here first. |
| P0 | `src/app/_components/library-catalog.tsx` | **Grid:** default variant + `className="!w-full"`. **List:** `variant="list"` + full novel fields (bio, tags, chapter count, rating count). Must be updated when props/variant model changes. |
| P0 | `src/app/_components/high-society-section.tsx` | Uses default variant + `fill` for grid cells. Update if `fill` or default layout API changes. |
| P1 | `src/app/_components/library-client.tsx` | Wraps `LibraryCatalog` only; usually unchanged unless catalog props change. |
| P1 | `src/app/library/page.tsx` | Supplies catalog data to `LibraryClient`; touch only if novel shape expected by cards changes. |
| P1 | `src/app/page.tsx` | Renders `HighSocietySection`; touch only if section/card contract changes. |
| P1 | `src/lib/content.ts` | Types/comments (`FeaturedNovel`, etc.) if `NovelCardData` fields or naming change. |
| P2 (optional follow-on) | `src/app/_components/profile/library-novel-card.tsx` | Not an importer of `NovelCard`; horizontal “cover + meta” pattern. Candidate for shared primitives or aligned variant API after P0 stabilizes. |
| P2 (optional follow-on) | `src/app/_components/current-affairs-section.tsx` | Inline `CurrentAffairsCard`; same visual family as compact rows. Optional consolidation with extracted row primitives. |
| P2 (optional follow-on) | `src/app/_components/profile/library-section-list.tsx` | Uses `LibraryNovelCard` only; revisit if profile list is folded into unified novel-row components. |

**Tests:** No `NovelCard` / `LibraryCatalog` unit tests found under the repo today; add or update tests if agents introduce coverage during the refactor.

### 2. Inconsistent Icon Usage
- **Files**: Shared chrome and feature modules across `src/app/` (dozens of `.tsx` files import `material-symbols-outlined`; representative: `navigation-bar.tsx`, `boudoir-header.tsx`, `library-header.tsx`, reading room, vault, auth flows).
- **Issue**: Icons styled inconsistently:
  - Inline style objects: `style={{ fontSize: isActive ? 28 : 24, color: ... }}`
  - Class variants: `text-primary text-xl`
  - Direct material symbols usage without abstraction
  - Repeated `fontVariationSettings: "'FILL' 1"` / `'FILL' 0'` for filled vs outline stars and toggles
- **Impact**: Difficulty maintaining consistent icon sizing, colors, and hover effects

#### Related Components

Implement a shared **`Icon`** (or equivalent) under `src/components/ui/` first, then migrate call sites in waves. Use repo search: `material-symbols-outlined`, `fontVariationSettings`, and inline style objects that set `fontSize` on symbol spans.

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `src/components/ui/icon.tsx` (create; see **Recommended Unification Strategy** → *Create a Centralized UI Component Library*) | Single API: `name`, `size` (`sm`–`xl` or mapped px), `className`, `filled`, `aria-hidden`. Owns Material Symbols font class and variation settings. |
| P0 | `src/app/_components/navigation-bar.tsx` | **Canonical bad example:** inline `fontSize` (active 28 / idle 24), `color` via CSS variables, conditional `filter` drop-shadow. First consumer to prove `Icon` supports “active tab” affordances. |
| P0 | `src/app/_components/boudoir-header.tsx` | Brand + actions: mix of `text-primary text-xl` and un-sized `material-symbols-outlined` on buttons. Align with `Icon` sizes and hover tokens. |
| P0 | `src/app/_components/library-header.tsx` | Same pattern as boudoir (brand glyph + search/close/clear). Migrate with boudoir for consistent header chrome. |
| P1 | `src/app/_components/reading-room/reading-hud.tsx` | Many icons with inline `fontSize` (e.g. 24–28) and bookmark `fontVariationSettings`. Reader HUD is high-visibility. |
| P1 | `src/app/_components/reading-room/comments-section.tsx` | Inline `fontSize`; like/heart uses dynamic `fontVariationSettings`. |
| P1 | `src/app/_components/reading-room/comments-sidebar.tsx` | Same patterns as comments-section (size + fill). |
| P1 | `src/app/_components/the-veil.tsx` | Inline `fontSize` (32 / 18 / 14) on symbols. |
| P1 | `src/app/vault/page.tsx` | Inline `fontSize` + filled star `fontVariationSettings`. |
| P1 | `src/app/_components/cast-gallery-modal.tsx` | Inline `fontSize: 20` on controls; other glyphs use `fontVariationSettings`. |
| P2 | **Stars / ratings cluster** | `src/app/_components/novel-card.tsx`, `src/app/_components/rating-display.tsx`, `src/app/_components/star-rating-input.tsx`, `src/app/_components/review-card.tsx`, `src/app/_components/hero-carousel.tsx`, `src/app/_components/chapter-list.tsx` — standardize filled star via `Icon` `filled` (or dedicated `StarIcon`). |
| P2 | **Auth** | `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`, `src/app/auth/forgot-password/page.tsx`, `src/app/auth/reset-password/page.tsx` — decorative + `fontVariationSettings`. |
| P2 | **Novel / author / profile** | `src/app/_components/novel-detail-header.tsx`, `src/app/_components/author/author-study-header.tsx`, `src/app/_components/author/follow-button.tsx`, `src/app/_components/author/bibliography-section.tsx`, `src/app/_components/author/trophy-case.tsx`, `src/app/_components/author/hexagon-avatar.tsx`, `src/app/_components/profile/profile-header.tsx`, `src/app/_components/profile/account-actions-list.tsx`, `src/app/_components/profile/reading-stats-row.tsx`. |
| P2 | **Vault & marketing** | `src/app/vault/vault-client.tsx`, `src/app/vault/coin-rain-animation.tsx`, `src/app/_components/vault-teaser-card.tsx`, `src/app/_components/campaign-detail.tsx`. |
| P2 | **Remaining `material-symbols` usages** | `src/app/_components/search-overlay.tsx`, `src/app/_components/library-catalog.tsx`, `src/app/_components/high-society-section.tsx`, `src/app/_components/current-affairs-section.tsx`, `src/app/_components/empty-state.tsx`, `src/app/_components/auth-prompt.tsx`, `src/app/_components/character-portrait.tsx`, `src/app/_components/synopsis-section.tsx`, `src/app/_components/news-article-card.tsx`, `src/app/novel/[novelId]/paperback/*`, `src/app/updates/**`, `src/app/admin/**`, `src/app/updates/[slug]/back-button.tsx`, etc. **Sweep:** after P0–P1, grep the codebase for stragglers and burn down file-by-file. |

**Tests:** No dedicated icon component tests found; add visual or unit tests for `Icon` size/filled/active variants when the primitive lands.

### 3. Mixed Responsive Design Approaches
- **Files**: `src/lib/responsive/*`, `src/app/globals.css`, and most of `src/app/**/*.tsx` (Tailwind responsive prefixes on layouts, typography, and grids).
- **Issue**:
  - **Split brain:** `src/lib/responsive/constants.ts` + `utils.ts` encode the same mobile/tablet/desktop tiers as Tailwind (`md` 768px, `lg` 1024px; `xs` 375px is Tailwind-only). Utilities are heavily used in **property tests** but most UI relies on **inline Tailwind** without calling those helpers.
  - **Hooks:** `usePointerDevice()` / `shouldApplyHoverForDevice()` appear in **`novel-card.tsx` only** among app components. `useViewport()` is implemented but **not consumed** by production components today—layout is almost entirely class-based breakpoints.
  - **CSS vs JS:** `globals.css` repeats `@media (min-width: …)` and `@media (hover: hover)` while components also use `md:`, `lg:`, and ad hoc `style={{ … }}` for safe-area and padding.
  - **Safe area:** `env(safe-area-inset-*)` and `calc(...)` padding are duplicated across headers, nav, reader HUD, overlays, and errors with slightly different formulas.
  - **Orientation:** There is **no systematic** portrait vs landscape tuning yet (e.g. no shared `orientation:` strategy); readability in landscape is mostly accidental via fluid layouts.
- **Impact**: Inconsistent responsive behavior, duplicated logic, and risk that a breakpoint change in one layer (Tailwind, CSS, or `BREAKPOINTS`) drifts from the others. Portrait/landscape polish is uneven across views.

#### Related Components

**Product goal (for coordinating agents):** Mobile, tablet, and desktop should share one mental model (same breakpoint names and tier semantics). Portrait and landscape should both remain readable: avoid fixed vertical stacks that waste landscape width; cap line lengths for body text; keep tap targets and chrome (nav, reader HUD) usable when vertical space shrinks.

**Recommended approach:** Pick a **default stack** and document it in `src/lib/responsive/` (or a short `README` next to that folder—only if the team wants prose there):
1. **Width tiers:** Tailwind `xs` / `md` / `lg` (and up) as the primary layout mechanism; keep `BREAKPOINTS` in `constants.ts` numerically aligned with `tailwind.config.ts` (single edit checklist when breakpoints change).
2. **Testable / numeric rules:** Continue using `getViewportSize`, `getLibraryGridColumnsForViewport`, etc. for logic that must match specs/tests; prefer **derived Tailwind classes** from the same constants where feasible (or accept explicit duplication with a comment pointing to `BREAKPOINTS`).
3. **Interaction:** Prefer **`@media (hover: hover)`** in CSS (already in `globals.css` for catalog hover) or a small wrapper over duplicating pointer checks; use `usePointerDevice` + `shouldApplyHoverForDevice` only where CSS cannot express the behavior.
4. **Orientation (new work):** Introduce shared patterns (utility classes or `orientation: landscape` blocks in `globals.css`) for reader, library grids, and long forms—assign a dedicated pass after width-tier alignment.

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `tailwind.config.ts` | Source of truth for `screens`; must stay in sync with `src/lib/responsive/constants.ts` → `BREAKPOINTS`. |
| P0 | `src/lib/responsive/constants.ts` | All grid column counts, max widths, strip visibility caps; document that values map to Tailwind tiers. |
| P0 | `src/lib/responsive/utils.ts` | Pure width-based helpers (`getViewportSize`, column resolvers, `shouldApplyHoverForDevice`); extend only with cross-cutting rules (e.g. future orientation helpers). |
| P0 | `src/lib/responsive/hooks.ts` | Decide whether `useViewport()` becomes a first-class pattern for client-only branching or remains optional; avoid new one-off `resize` listeners in random components. |
| P0 | `src/app/globals.css` | Consolidate repeated `@media (min-width: …)` / `(hover: hover)` with Tailwind theme tokens where possible; reduce drift from component-level `md:`/`lg:`. |
| P1 | `src/app/_components/novel-card.tsx` | Only production consumer of `usePointerDevice` / `shouldApplyHoverForDevice`; revisit when hover strategy is centralized (CSS vs hook). |
| P1 | `src/app/_components/reading-room/reading-hud.tsx` | Imports `READING_HUD_*` from responsive constants; mixes CSS variables, `env(safe-area-inset-*)`, and fixed padding—template for reader chrome unification. |
| P1 | `src/app/_components/profile/followed-authors-strip.tsx` | Uses `PROFILE_HEXAGON_CLIP` from constants; verify strip counts vs Tailwind layout. |
| P1 | **Safe-area / chrome cluster** | `navigation-bar.tsx`, `boudoir-header.tsx`, `library-header.tsx`, `novel-detail-header.tsx`, `author/author-study-header.tsx`, `search-overlay.tsx`, `reading-hud.tsx`, `comments-section.tsx`, `comments-sidebar.tsx`, `vault/page.tsx`, `error.tsx`, `not-found.tsx`, `novel/[novelId]/paperback/*` — normalize to shared padding utilities or CSS variables (`--safe-area-*`). |
| P2 | **Route-level layout sweeps** | Audit and align patterns **per surface** (same breakpoint vocabulary within each): `src/app/page.tsx` (Boudoir), `library/*`, `novel/[novelId]/*`, `reading-room` subtree, `author/*`, `vault/*`, `profile/*`, `auth/*`, `updates/*`, `admin/*`. Grep hints: `md:`, `lg:`, `xs:`, `max-w-[`, `grid-cols-`, `min-h-`, `aspect-`. |
| P2 | **Property tests** | `src/__tests__/properties/*.test.ts` import responsive utils/constants; update in lockstep with any breakpoint or column contract change. |

**Tests:** Responsive behavior is already covered by multiple property tests (`responsive.test.ts`, `boudoir-layout`, `library-catalog`, `novel-detail`, `reading-room`, `authors-study`, `vault`, `profile-responsive`, `navigation-properties`, `touch-hover-interactions`, etc.). Any change to `BREAKPOINTS` or grid helpers must run the full suite.

### 4. Inconsistent State Management for UI Elements
- **Files**: Client components under `src/app/_components/**`, `src/app/_components/reading-room/**`, `reading-room-client.tsx`, `vault-client.tsx`, route `page.tsx` files that render `NavigationBar`, and `src/app/_components/auth-prompt.tsx` consumers.
- **Issue**:
  - **Nav tab:** Every route passes `activeTab` into `NavigationBar` manually (`page.tsx` / nested pages). The current route is already implied by the URL; this is **duplicated, easy to mis-wire** (e.g. several novel-adjacent routes use `activeTab="boudoir"` while the user is not on `/`).
  - **Ephemeral UI:** Overlays and panels use **local `useState`** with similar shapes but different names: `searchOpen` (Boudoir), `filterOpen` + query (Library header), `viewMode` grid/list (`library-catalog`), `commentsOpen` / `hudVisible` (reader), `showFontPanel` / `showLinePanel` (HUD), `castGalleryOpen` (players), many **`authPromptOpen` vs `showAuthPrompt`** pairs with duplicated `AuthPrompt` wiring.
  - **Auth prompt copy:** Comments use **extra state** (`authPromptMessage`) for strings; other call sites hardcode `message` on `AuthPrompt`—same concern, two patterns.
  - **URL vs memory:** Some flows are **search-param driven** (`vault` success/canceled, auth `returnUrl`), while library filter and catalog view mode are **not shareable/bookmarkable** in the URL—fine for MVP, but inconsistent when deciding “what is source of truth.”
  - **Admin:** Several `*-client.tsx` forms use local `open` / `loading` toggles with no shared primitive.
- **Impact**: Unclear ownership of UI state, repeated boilerplate, risk of desync between header and child (e.g. filter vs catalog), and harder refactors (e.g. deep-linking search or restoring reader UI after refresh).

#### Related Components

**Coordination principles for agents:**
1. **Derive when possible:** Prefer pathname (`usePathname`) or `searchParams` for nav highlight and shareable UI (filters, view mode) where product requirements allow.
2. **Lift before duplicating:** If two siblings need the same open/close truth (e.g. library header filter + catalog), colocate state in the nearest parent (`library-client.tsx`) and pass props/callbacks.
3. **Name consistently:** Pick one convention for modals (`isOpen` / `onOpenChange` or `open` / `onClose`) and one for auth gating (`authPromptOpen` everywhere, or a thin `useAuthPrompt()` hook).
4. **Keep server boundaries:** RSC pages can stay thin; client wrappers own `useState` for overlays.

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `src/app/_components/navigation-bar.tsx` + **all callers** | Today: `src/app/page.tsx`, `library/page.tsx`, `vault/page.tsx`, `updates/page.tsx`, `updates/[slug]/page.tsx`, `profile/page.tsx` (two branches), `novel/[novelId]/page.tsx`, `novel/[novelId]/reviews/page.tsx`, `author/[authorId]/page.tsx`. Optional unification: client shell that sets active tab from `usePathname()` so pages stop passing string literals. |
| P0 | `src/app/_components/auth-prompt.tsx` | Controlled modal API (`isOpen`, `onClose`, `returnUrl`, `message`); standardize consumer pattern once naming is chosen. |
| P1 | `src/app/_components/boudoir-header.tsx` | Local `searchOpen` + controlled `SearchOverlay` (`query` / `onQueryChange`). Candidate to colocate or URL-sync if search becomes shareable. |
| P1 | `src/app/_components/search-overlay.tsx` | Fully controlled overlay; parent owns open + query state. |
| P1 | `src/app/_components/library-header.tsx` | `filterOpen` + local query; must stay aligned with `LibraryCatalog` filter props from `library-client.tsx`. |
| P1 | `src/app/_components/library-client.tsx` | Lifts `filterQuery` for catalog; does **not** own grid/list `viewMode` (that lives in `library-catalog.tsx`)—review whether both should lift here for one “library UI state” owner. |
| P1 | `src/app/_components/library-catalog.tsx` | Local `viewMode` (`grid` \| `list`); only this subtree needs it unless deep-linked. |
| P1 | `src/app/_components/reading-room/reading-room-client.tsx` | Owns `hudVisible`, `commentsOpen`, unlock flow state; coordinates HUD + sidebar + sheet. Primary owner for reader chrome visibility. |
| P1 | `src/app/_components/reading-room/reading-hud.tsx` | `showFontPanel`, `showLinePanel`; ensure mutual exclusivity / focus rules if consolidated. |
| P1 | `src/app/_components/reading-room/comments-section.tsx` | `showAuthPrompt` + `authPromptMessage`; align naming with `comments-sidebar.tsx` (duplicate pattern). |
| P1 | `src/app/_components/reading-room/comments-sidebar.tsx` | Same auth-prompt pattern as comments-section. |
| P1 | `src/app/_components/players-section.tsx` | `castGalleryOpen`, `authPromptOpen`; delegates auth to `AuthPrompt`, gallery to modal. |
| P1 | `src/app/_components/cast-gallery-modal.tsx` | Internal flip/confirm/endorse state; document as self-contained modal island. |
| P2 | **Auth prompt duplicates** | `current-affairs-section.tsx`, `novel-detail-header.tsx`, `author/follow-button.tsx`, `vault/vault-client.tsx` — each owns `authPromptOpen`; consider a tiny shared hook or context only if duplication grows. |
| P2 | `src/app/_components/synopsis-section.tsx` | Local `expanded` for long synopsis; low risk; same “toggle” family as view modes. |
| P2 | `src/app/admin/**/*-client.tsx` / `*-edit-form.tsx` | Accordion `open`, `loading`; optional shared `useDisclosure` later. |

**Tests:** Little or no automated coverage targets ephemeral overlay/tab state today; add tests when extracting hooks (e.g. pathname-derived `activeTab`, or lifted library state). Existing property tests focus elsewhere; run `npm run test` / CI after refactors that touch reader or library flows.

### 5. Non-standardized Interaction Patterns
- **Files**: `src/app/globals.css` (shared hover utilities), `src/app/_components/**/*.tsx`, auth forms, reading room, vault, and `navigation-bar.tsx` (inline hover styling on icons).
- **Issue**:
  - **Hover channels:** Three coexisting approaches: (1) **CSS** utilities guarded by `@media (hover: hover)` — e.g. `.catalog-item-hover`, `.overlay-sheen` / `.card:hover`, `.fab-hover-scale-lg`, `.btn-gold:hover` in `globals.css`; (2) **Tailwind** `hover:*` / `group-hover:*` on components (often **not** gated, so touch devices may “stick” hover until tap elsewhere); (3) **JS-gated** classes — `novel-card.tsx` applies `catalog-item-hover` only when `shouldApplyHoverForDevice(usePointerDevice())` is true (overlaps conceptually with CSS `@media (hover: hover)` on the same class family elsewhere).
  - **One-off chrome:** `navigation-bar.tsx` uses **inline `style`** for active tab icon (size, color, `filter` drop-shadow) instead of the same tokens as headers / catalog.
  - **Focus rings:** Mix of `focus-visible:ring-2 focus-visible:ring-primary` (preferred), plain `focus:ring-2`, `focus:ring-0` on inputs, and CSS variable–based `focus:ring-[var(--primary)]` in `auth-prompt.tsx` — inconsistent offset/radius and keyboard discoverability.
  - **Press / tap feedback:** `active:scale-95`, `active:scale-[0.98]`, `active:scale-[0.99]`, and `active:scale-125` (pagination dots) appear ad hoc; disabled states sometimes reset scale (`disabled:active:scale-100`), sometimes not.
  - **Touch affordances:** `touch-manipulation` appears only in spots like `parallax-hero.tsx`, `star-rating-input.tsx` (see `TOUCH_ACTION_MANIPULATION` in `src/lib/responsive/constants.ts` and `touch-hover-interactions` tests) — not applied consistently to small targets or horizontal carousels.
- **Impact:** Hover and focus feel different screen-to-screen; redundant or conflicting hover detection; uneven tactile feedback on press.

#### Related Components

**Coordination principles for agents:**
1. **Prefer CSS `@media (hover: hover)`** for visual hover-only effects (already used in `globals.css` for catalog/FAB/buttons); avoid duplicating the same guard in JS unless a behavior cannot be expressed in CSS.
2. **Standardize focus:** Use **`focus-visible`** + ring + offset on interactive elements; document exceptions (e.g. inputs use border/ring-0 patterns).
3. **Standardize press:** Pick one **scale token** (e.g. `active:scale-[0.98]` for buttons, `0.99` for dense list rows) and ship via a **`Button`** / **`pressable`** utility class from `src/components/ui/` when that layer exists.
4. **Align with Issue 3:** If `novel-card` drops JS hover gating, verify catalog hover still respects touch (THE-54 / THE-85 comments in CSS).

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `src/app/globals.css` | Canonical patterns: `.catalog-item-hover`, `.overlay-sheen`, `.fab-hover-scale` / `-lg`, `.btn-gold`, `.btn-hover-brightness` — extend here before inventing new hover classes in random components. |
| P0 | `src/app/_components/novel-card.tsx` | Only user of **JS + CSS** double guard for catalog hover; coordinate any simplification with `globals.css` and `touch-hover-interactions` tests. |
| P1 | `src/app/_components/navigation-bar.tsx` | Replace inline icon hover/active visuals with tokens shared with rest of app (or `Icon` + class variants from Issue 2). |
| P1 | `src/app/_components/cast-gallery-modal.tsx` | Uses `fab-hover-scale-lg` + many `active:scale-*` / `hover:*` on FAB and controls; good candidate to align with global FAB utilities. |
| P1 | `src/app/_components/auth-prompt.tsx` | `focus:ring-2` + CSS vars; align ring style with `focus-visible` pattern used in headers / search overlay. |
| P1 | `src/app/_components/reading-room/reading-hud.tsx` | Dense icon bar: `hover:text-primary`, `active:scale-95`, `focus-visible:ring-*` — template for reader controls once standardized. |
| P1 | `src/app/_components/search-overlay.tsx`, `library-header.tsx`, `boudoir-header.tsx`, `library-catalog.tsx` | Buttons and list rows: mix of `focus-visible`, `active:scale-95` / `0.99`; normalize as one pass. |
| P1 | Auth primary actions | `login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx` — shared `active:scale-[0.98]` + `hover:bg-white` on gold buttons; fold into future `Button` variant. |
| P2 | **`group-hover` / card sheen surfaces** | `library-novel-card.tsx`, `vault-client.tsx`, `hero-carousel.tsx`, `news-article-card.tsx`, `current-affairs-section.tsx`, `paperback-client.tsx` (`overlay-sheen`), `character-portrait.tsx`, `author/*` (trophy, bibliography, hexagon, followed-authors-strip), `the-veil.tsx` — audit that hover does not rely solely on unguarded Tailwind `hover:` where touch stickiness matters. |
| P2 | `src/app/_components/parallax-hero.tsx`, `star-rating-input.tsx` | Reference implementations for `touch-manipulation` + motion-safe transitions; replicate pattern on other small tappable chrome. |
| P2 | Misc controls | `novel-detail-header.tsx`, `vault/page.tsx`, `chapter-list.tsx`, `reviews-section.tsx`, `players-section.tsx`, `follow-button.tsx`, paperback shells — `active:scale-*` and hover only; sweep after P1 tokens exist. |

**Tests:** `src/__tests__/properties/touch-hover-interactions.test.ts` encodes expectations around touch vs hover (`shouldApplyHoverForDevice`, `TOUCH_ACTION_MANIPULATION`). Run it after changing `novel-card`, catalog CSS, or global hover utilities. Consider adding similar checks when new shared `Button`/pressable primitives land.

### 6. Loading & Error State Inconsistency
- **Files**: `src/app/_components/empty-state.tsx`, `src/app/_components/shimmer-placeholder.tsx`, `src/app/_components/library-catalog.tsx`, `src/app/_components/high-society-section.tsx`, `src/app/_components/search-overlay.tsx`, `src/app/page.tsx` (Boudoir empty hero), `src/app/library/page.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, auth `*form.tsx` (submission pending copy), `src/app/_components/the-latest-section.tsx`, and most other routes (often **no** dedicated loading UI yet).
- **Issue**:
  - **Empty vs zero data:** `EmptyState` (Pinyon-style script headline + optional subtitle) is used in library catalog, high society, current affairs, and profile lists — but **`src/app/page.tsx`** when there are no hero items renders a **one-off** centered `font-script` line (“Your shelf is waiting.”) instead of reusing `EmptyState`, so typography and layout diverge from the design system component.
  - **Loading:** `ShimmerPlaceholder` exists and is wired into **`library-catalog.tsx`** (`loading` prop) and **`high-society-section.tsx`** (`loading` prop), but the Boudoir page **never passes `loading`** to `HighSocietySection`—the shimmer branch is effectively unused in production today. There is **no `loading.tsx`** route segment; server pages mostly `try/catch` and fall back to empty arrays without a “fetching” phase for the user.
  - **Silent sections:** `TheLatestSection` returns **`null` when there are no articles** — no empty or skeleton state; users see nothing for that block.
  - **Search overlay:** Supports a **`loading`** prop for in-overlay fetch UX, but parents must wire it consistently when search becomes async.
  - **Errors:** `error.tsx` and `not-found.tsx` are **themed and consistent** with each other; route `catch` blocks often **swallow errors** and show empty data instead of an error or retry surface (e.g. Boudoir `Promise.all` catch, library `getAllNovels` catch).
  - **Forms:** Auth and other forms use **`isPending`** / `useTransition` text (“Signing in…”) — a different pattern from skeleton **Shimmer** — which is fine, but should be named in a shared “loading taxonomy” (inline vs page vs overlay).
- **Impact:** Users cannot tell “still loading” from “nothing here”; failures can look like empty catalogs; marketing copy for empty states is inconsistent.

#### Related Components

**Coordination principles for agents:**
1. **Taxonomy:** Decide labels for three layers — **route loading** (Suspense + `loading.tsx` or streaming), **section skeleton** (`ShimmerPlaceholder` / future `Loader` variants), **inline action loading** (`isPending`, disabled buttons). Document which layer each surface uses.
2. **Reuse `EmptyState`:** Replace ad hoc empty markup (e.g. Boudoir hero fallback) with `EmptyState` + props (`showBrowse`, `subtitle`) unless the design explicitly requires a different layout.
3. **Errors:** Prefer **error boundaries** or explicit **error UI** over silent `catch {}` when user-facing fetches fail; keep `error.tsx` as the catastrophic fallback.
4. **Wire optional props:** If a component exposes `loading`, route owners should pass it when data is streamed or refetched client-side.

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | `src/app/_components/empty-state.tsx` | Canonical empty UI; extend cautiously (props only). Align all “no data” screens with this or document exceptions. |
| P0 | `src/app/_components/shimmer-placeholder.tsx` | Canonical skeleton primitive; pair with future `src/components/ui/loader.tsx` from the strategy checklist when introduced. |
| P1 | `src/app/_components/library-catalog.tsx` | Reference implementation: `loading` → shimmer grid; filtered empty vs true empty messages. Use as template for other grids. |
| P1 | `src/app/_components/high-society-section.tsx` | Implements `loading` + shimmer + `EmptyState`; **call sites** (`src/app/page.tsx`) should pass `loading` when trending data is streamed or client-fetched; otherwise remove dead prop or document as reserved. |
| P1 | `src/app/page.tsx` | Swallows fetch errors into empty arrays; empty hero uses custom markup — migrate to `EmptyState` and consider surfacing recoverable errors. |
| P1 | `src/app/library/page.tsx` | Swallows `getAllNovels` errors → empty catalog (`EmptyState` only if list empty, not on hard failure). Differentiate “no novels” vs “could not load” when product allows. |
| P1 | `src/app/_components/the-latest-section.tsx` | No articles → `null`; consider `EmptyState` (minimal) or intentional hide — product decision, then implement consistently with other sections. |
| P1 | `src/app/_components/search-overlay.tsx` | Implements `loading` UI branch; ensure `BoudoirHeader` (or future data layer) sets `loading` when search is async. |
| P1 | `src/app/error.tsx`, `src/app/not-found.tsx` | Keep as reference for tone and layout; align any new global error surfaces (e.g. `global-error.tsx` if added) with these tokens. |
| P2 | **Form submission feedback** | `login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`, `reset-password/page.tsx` server try/catch — standardize pending labels and error display vs `EmptyState` / toast patterns. |
| P2 | **Vault / commerce** | `src/app/vault/vault-client.tsx` uses shimmer-like animation for packs; align with `ShimmerPlaceholder` or document as intentional distinct pattern. |
| P2 | **Remaining routes** | Novel detail, reading room, profile, author study, updates, admin — audit for missing skeletons, empty lists, and silent `catch`; add `loading.tsx` or Suspense boundaries where streaming is adopted. |

**Tests:** `performance-loading.test.ts` covers **image** lazy-loading constants, not UI skeletons. Add component or route tests when empty/loading contracts stabilize (e.g. `LibraryCatalog` loading prop, `EmptyState` snapshots). Run existing property suite after changing catalog or home fetch behavior.

### 7. Component Composition Patterns
- **Files**: Most of `src/app/_components/**/*.tsx`, `src/app/_components/reading-room/**`, `src/app/_components/profile/**`, `src/app/_components/author/**`, and layout helpers like `main-layout-container.tsx`.
- **Issue**:
  - **`className` extension:** Only a **small set** of shared components accept `className?: string` and merge it onto the root node (e.g. `novel-card.tsx`, `empty-state.tsx`, `shimmer-placeholder.tsx`, `credit-balance.tsx`, `news-article-card.tsx`, `character-portrait.tsx`, `main-layout-container.tsx`). Most sections (`high-society-section.tsx`, `current-affairs-section.tsx`, `library-catalog.tsx`, `boudoir-header.tsx`, `navigation-bar.tsx`, `hero-carousel.tsx`, etc.) **fix layout in internal string constants**—callers must wrap in extra `<div>`s or duplicate spacing classes when the design reference does not quite match a route layout. **`library-catalog.tsx`** already relies on **`className="!w-full"`** on `NovelCard` to fight default widths—sign that composition escape hatches are uneven.
  - **Merging:** There is **no shared `cn()` / `clsx`** helper; components concatenate `` `${base} ${className}` `` manually, which is fine at small scale but easy to get wrong if Tailwind conflicts appear.
  - **Children vs data-only:** Almost all screens are **data-in, JSX-out** with **no `children` slot**. `MainLayoutContainer` is the main exception (`children` + `className`). Optional UI is expressed as **named props or render callbacks** (e.g. cast gallery endorsement areas, modal `onAuthPrompt`) rather than a consistent `slots` or compound-component pattern.
  - **Variants vs booleans:** Extension is often a **string `variant`** (`novel-card`, `review-card`) or **fixed prop sets** rather than a unified discriminated union (see Issue 1). `HeroCarousel` adds **separate legacy props** (`featured` vs `items`) behind a type guard—powerful but harder to discover than one clear constructor.
  - **`forwardRef` / DOM passthrough:** Not used in `_components` today; focus management and “merge refs” are handled ad hoc inside modals and overlays.
- **Impact:** Harder page-level tuning without wrapper noise; duplicated layout code; uneven discoverability of extension points for agents and future UI primitives.

#### Related Components

**Coordination principles for agents:**
1. **Align with strategy checklist:** Target rule already stated below — **interactive / reusable** building blocks should accept **`className?: string`**; merge on the outermost element the author expects callers to position.
2. **Sections:** For full-bleed sections tied to a single reference HTML file, either (a) add optional `className` (and optionally `id` for anchors) on the root `<section>`, or (b) document “do not extend; wrap in layout” in the component file header—pick one per component, not both silently.
3. **Prefer named slots over `children`** when only one sub-region varies (keeps typing explicit); use `children` for true generic wrappers (`MainLayoutContainer`, future `Card` body).
4. **Central `cn()`:** When adding `src/components/ui/*`, introduce a small **`cn(...classes)`** (e.g. `clsx` + `tailwind-merge`) and migrate high-touch components first.

| Priority | Path | Role / assignment notes |
|----------|------|-------------------------|
| P0 | **Convention doc** | Record in **Recommended Unification Strategy** (props conventions) or `AGENTS.md`: which folders must export `className` on new primitives; how to merge; when sections are sealed. |
| P1 | **Existing `className` exemplars** | `novel-card.tsx`, `empty-state.tsx`, `shimmer-placeholder.tsx`, `credit-balance.tsx`, `news-article-card.tsx`, `character-portrait.tsx`, `main-layout-container.tsx` — keep as reference implementations when adding the same prop elsewhere. |
| P1 | **`library-catalog.tsx` + `novel-card.tsx`** | Today: grid cells pass **`className="!w-full"`** to override default card width — when Issue 1 refactors variants/`fill`, revisit whether catalog should own width via parent grid only (reduces `!` important hacks). |
| P1 | **Section wrappers (common extension targets)** | `high-society-section.tsx`, `current-affairs-section.tsx`, `the-latest-section.tsx`, `library-catalog.tsx` (root `<section>`), `players-section.tsx`, `synopsis-section.tsx`, `reviews-section.tsx` — add root `className?: string` if routes need margin/padding without extra DOM; default `""`. |
| P1 | **Headers / chrome** | `boudoir-header.tsx`, `library-header.tsx`, `novel-detail-header.tsx`, `author/author-study-header.tsx` — usually page-fixed; lower priority unless a route stacks two headers or needs offset tuning. |
| P1 | `src/app/_components/hero-carousel.tsx` | No `className`; has **legacy vs modern prop union** — document in JSDoc or simplify API before bolting on layout props. |
| P2 | **Large prop surfaces** | `reading-room/reading-room-client.tsx`, `reading-room/reading-hud.tsx`, `reading-room/comments-section.tsx`, `reading-room/comments-sidebar.tsx`, `cast-gallery-modal.tsx` — consider splitting presentational subcomponents or grouped prop objects (`hudActions`, `commentsToolbar`) before adding more optional fields. |
| P2 | **Callback slots** | `cast-gallery-modal.tsx` (`onAuthPrompt`), `players-section.tsx`, `follow-button.tsx` — pattern is fine; align naming with future auth hook (Issue 4) if extracted. |
| P2 | **Forms / composers** | `novel-review-composer.tsx`, `star-rating-input.tsx`, `metadata-pills.tsx` — closed components; add `className` only if embedded in multiple layouts with different spacing. |

**Tests:** No dedicated tests for `className` merging or composition contracts; rely on visual QA or E2E if added later. Property tests that assert layout constants may need updates if section roots gain optional classes.

## Recommended Unification Strategy

### 1. Create a Centralized UI Component Library
**Location**: `src/components/ui/`

**Components to create**:
- `Button` (primary, secondary, icon-only, loading states)
- `Icon` (wrapper for material symbols with consistent sizing/variants)
- `Input` (text, search, with labels, validation states)
- `Card` (base card with variants: elevated, outlined, hoverable)
- `Badge` (status indicators, tags, chips)
- `Avatar` (user/author avatars with fallbacks)
- `Loader` (spinners, skeleton placeholders)
- `Modal` / `Dialog` (overlay containers)
- `Tooltip` (consistent tooltip behavior)

### 2. Standardize Component APIs
**Props conventions**:
- All interactive components accept `className?: string` for extension
- Variant props use discriminated unions: `variant: "default" | "outline" | "ghost" | "link"`
- Size props: `size: "sm" | "md" | "lg" | "xl"`
- Consistent naming for callbacks: `onChange`, `onClick`, `onSubmit`
- All components forward refs to root element when appropriate

### 3. Establish design token usage

Prefer **CSS variables** wired in `src/app/layout.tsx` and **Tailwind theme extensions** in `tailwind.config.ts` (colors, `fontFamily`, spacing). Add small helpers only when they remove real duplication; avoid a parallel `lib/theme/*` stack unless the team explicitly wants one.

### 4. Hooks and responsive behavior

Prefer **`src/lib/responsive/`** for breakpoint math, pointer/hover policy, and tests. Add new hooks there (or thin wrappers in `src/components/ui/`) only when CSS cannot express the behavior—see **Issue 3** and **Issue 5** for coordination.

### 5. Consistent state patterns

Align with **Issue 4**: derive nav/tab state from the URL where possible, lift shared overlay state to parents, and name modal/auth toggles consistently before introducing new abstractions.

### 6. Loading and error states

Align with **Issue 6** and the catalog: promote `ShimmerPlaceholder` / `EmptyState`, document a loading taxonomy (route vs section vs inline), and prefer error boundaries over silent `catch` when users should see a failure.

### 7. Documentation and enforcement

- `src/components/ui/README.md` as the catalog index (cross-linked in [Discovery for contributors](#discovery-for-contributors))
- Optional Storybook or `/dev/ui` only if the team wants visual browsing
- Optional ESLint or review checklist for new primitives

---

## Rollout note (avoid duplicate roadmaps)

**Authoritative sequencing** is [Implementation roadmap (suggested)](#implementation-roadmap-suggested) (Phases 0–5) earlier in this document. If you map work to calendar weeks, line **Week 1** up with **Phase 1**, **Weeks 2–3** with **Phases 2–3**, and later weeks with **Phases 4–5** plus hardening—do not maintain a separate numbered phase system without stating which doc section wins.
