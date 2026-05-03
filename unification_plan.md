# Midnight Satin — UI unification & component catalog

## Purpose

The app’s **current UI is in good shape**: screens align with `reference/`, typography and noir–gold language read as intentional, and feature components under `src/app/_components/` are maintainable for what exists today.

This plan exists so **future features** ship faster and stay visually unified. The target is a **small, documented catalog of reusable primitives and patterns** (back navigation, icon treatment, section headings, body copy blocks, actions, loading shells) so contributors **look up or import existing pieces** instead of inventing parallel implementations.

Midnight Satin is a **reading product**: long sessions depend on **typographic calm**. The design system already assigns roles—**display** (novel / display titles), **header** (section labels, nav chrome), **body** (prose, reviews, synopsis), **ui** (buttons, metadata, small caps), **script** (accent moments like empty states)—via Tailwind `font-*` utilities backed by CSS variables in `layout.tsx`. The awkwardness to avoid is **adjacent blocks that should read as one rhythm** (e.g. a section label + helper line + “View all”) mixing **different families or arbitrary size/weight combos** that were chosen ad hoc. The catalog should make the **right font role the default** for each semantic pattern so components sitting next to each other **match by construction**, not by memory.

**Scope:** align implementation with a shared catalog over time. **Not** a wholesale redesign or mandatory rewrite of working screens. **Reference work** (`reference/` HTML and future **Pencil** sources) runs as a **parallel design track** so specs stay easy to edit and consistent before they flow into React.

---

## Current state vs target (alignment map)

| Area | What we have today | What we target |
|------|-------------------|----------------|
| **Where UI lives** | Almost all UI in `src/app/_components/` (+ route-local pieces e.g. `updates/[slug]/back-button.tsx`). No shared `src/components/ui/` tree yet. | **`src/components/ui/`** for cross-route primitives + README “catalog”; `_components` can import from `ui/` or host feature-specific compositions. |
| **Design truth** | **`reference/*.html`** (18 screens + PRD), Tailwind, CSS variables. HTML grew screen-by-screen; **tablet vs mobile** pairs and **cross-screen patterns** (headers, “View all”, back affordances) are not fully normalized. | **`reference/pencil/*.pencil`** (or one workspace per major flow) as the **editable source** for layout and type rhythm; HTML either **exported from Pencil** or **manually reconciled** after Pencil changes. Unification pass aligns shared chrome across pencils, then **HTML + app** follow. Catalog README links **screen → pencil file → HTML file → route**. |
| **Responsive / hover** | **`src/lib/responsive/`**: `usePointerDevice`, `shouldApplyHoverForDevice`, tests; used e.g. in `novel-card`. | Keep extending this module; document when to pair with `catalog-item-hover` vs CSS-only `hover:`. |
| **Empty / loading** | **`EmptyState`**, **`ShimmerPlaceholder`**, grid skeleton in **`library-catalog`**. | Re-export or wrap as catalog **`EmptyState`** / **`Skeleton`**; add skeleton paths to more async surfaces when needed. |
| **Section actions** | **`SectionViewAllLink`** / **`SectionViewAllButton`** on novel detail (`reviews-section`, `players-section`). Home/author still use bespoke “View All” links/buttons. | **`SectionViewAll*`** with **variants** (literata vs uppercase UI) + migrate remaining call sites. |
| **Novel detail headings** | Same `<h3>` class string copy-pasted in **players, reviews, synopsis, chapter-list**. | One **`DetailSectionHeading`** (or `ScreenSectionTitle`) + optional `className`. |
| **Icons** | Many raw **`<span className="material-symbols-outlined" …>`** calls; mix of Tailwind sizes and **inline `fontSize`/`color`** (`navigation-bar`, reading room, vault, veil, etc.). | **`Icon`** (or `MsIcon`) primitive: size + tone + filled + `aria-hidden` defaults; reduce magic numbers. |
| **Back / up navigation** | **Several independent patterns:** `novel-detail-header` (`router.back` + icon), `reading-hud`, `vault/page`, `author-study-header`, `paperback-page-shell`, `updates/.../BackButton`, `reviews/page` uses text “← Back to novel”, cast gallery chevrons + back. | **`BackLink`** / **`BackButton`** (props: `href` vs `onBack`, optional label, icon size) + usage matrix in README so new screens pick one API. |
| **Stars / ratings** | **`rating-display`**, **`review-card`** row, **`novel-card`** badge — three separate Material star setups. | Shared **`StarIcon`** / **`StarRow`** / **`NumericRatingBadge`** as needed; keep `RatingDisplay` for aggregate line. |
| **Cards / surfaces** | `.card`, `catalog-item-hover`, various one-off borders/blur. | **`Card`** primitive with variants that map to existing utility classes where possible. |
| **Composition** | Some components expose **`className`** (`novel-card`, `empty-state`, `shimmer-placeholder`, …); many do not. | Primitives and layout helpers accept **`className`** + **`forwardRef`** where it matters; document exceptions. |
| **Typography (reading-first)** | Tailwind exposes **`font-display`**, **`font-header`**, **`font-body`**, **`font-ui`**, **`font-script`**; usage is broadly aligned with `reference/` but **the same semantic slot** (e.g. secondary line under a title, metadata row, “View all”) sometimes picks **different families or tracking** in neighboring components. | **Typography matrix** in catalog README (role → utility → when to use). Optional **`Text`** primitive with variants (`displayTitle`, `sectionLabel`, `body`, `caption`, `uiCaps`) so adjacent rows **inherit one system**. Opportunistic fixes when touching a file—especially **home stacks**, **novel detail stacks**, and **reader chrome**. |

---

## Target component catalog (draft)

Group names are suggestions; exact file names can follow whatever naming convention the repo adopts when `src/components/ui/` is added.

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

---

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

Static HTML today includes, among others: `midnight_satin_prd.html`, `midnight_satin_home.html`, `midnight_satin_home_tablet.html`, `the_novel_detail.html`, `the_novel_detail_tablet.html`, `the_reading_room.html`, `the_reading_room_tablet.html`, `the_reading_room_with_comments.html`, `the_cast_gallery.html`, `the_cast_gallery_with_endorsements.html`, `the_authors_study.html`, `the_authors_study_tablet.html`, `the_vault_store.html`, `the_library_grid.html`, `the_library_list.html`, `the_library_empty.html`, `the_login.html`, `the_register.html`. **No `.pencil` files in repo yet**—this is a planned addition.

### Target layout (suggested)

- Add **`reference/pencil/`** (or repo root `design/` if you prefer separation from shipped HTML—pick one and document it in AGENTS / Cursor rule).
- **Naming parity:** one `.pencil` per **logical screen family** where it helps, e.g. `midnight_satin_home.pencil` containing **mobile + tablet** artboards, mirroring `midnight_satin_home.html` + `midnight_satin_home_tablet.html`; same idea for novel detail, reading room, author study, library.
- **Shared library:** in Pencil, define **reusable blocks** aligned with the app catalog intent: back row, bottom nav, section title + “View all”, novel card tile, reader HUD strip, empty state, primary button—so unification is **edit once, propagate** before touching HTML/React.
- **PRD:** `midnight_satin_prd.html` stays the **token and type spec**; either a **dedicated `design_system.pencil`** slice or a pinned page in the main workspace that **does not drift** from PRD numbers (colors, font roles).

### Workflow (recommended)

1. **Create Pencil files** alongside existing HTML names so diffs and discussion stay traceable.
2. **Unify in Pencil first** — align type scale, section chrome, and spacing across screens that appear in one user session (e.g. home → novel detail → reader).
3. **Export or hand-port** to `reference/*.html` (whatever your Pencil → HTML workflow supports); keep HTML **valid, self-contained** for designers who do not use Pencil and for CI/review.
4. **Update Cursor rule / AGENTS** to say: *implementation matches `reference/` HTML; if HTML and Pencil disagree after a pass, **Pencil wins** until HTML is updated.*

### Cursor / tooling

- **Pencil extension** (e.g. Pencil for Cursor) is the intended editor for `.pencil` files; keep binaries or large assets out of git if your team policy prefers **LFS** or a linked design repo—note the choice in this plan when you decide.

---

## Recommended approach

1. **Treat the catalog as additive** — New features import from `src/components/ui/` when a primitive exists; existing screens migrate opportunistically (touch-a-file rule: if you edit a file for a bug/feature, consider swapping one pattern to the catalog).
2. **Start with navigation + typography chrome** — `BackLink`/`BackButton`, `DetailSectionHeading`, `Icon` — because they appear on almost every new route and are easy to verify visually. Publish the **typography matrix** in README as soon as Phase 1 starts so font choices stay consistent **before** a large `Text` primitive exists.
3. **Then actions and feedback** — `Button`, `Skeleton` alias, `Dialog` baseline.
4. **Then denser refactors** — `novel-card` composition, full icon sweep.
5. **Reference track in parallel** — Pencil library + HTML unification feed the **same typography matrix** and catalog primitives; app work should not outrun reference without an explicit exception.

---

## Smaller-scope first steps (concrete)

1. **`DetailSectionHeading`** — four novel-detail files.
2. **`BackLink` / `BackButton`** — introduce API; migrate `BackButton` in updates, `novel-detail-header`, one reading-room entry point, and align `reviews/page` text back to the same component with a `label` prop.
3. **`Icon`** + **`navigation-bar`** migration as proof.
4. **`SectionViewAll*` variants** + home/author migrations.
5. **Star primitives** + incremental adoption in `novel-card` / `review-card`.

6. **Typography pass on one vertical slice** — e.g. novel detail page: section headings + `SectionViewAll*` + first line of each section body use the matrix; fix any neighbor that breaks rhythm.

7. **Bootstrap `reference/pencil/`** — add `.pencil` for **home + novel detail** first (highest traffic), define shared section header + view-all + card styles there, then reconcile the two HTML pairs to match.

---

## Implementation roadmap (suggested)

### Phase 0 — Reference: Pencil + HTML unification (design track)

- [ ] Add **`reference/pencil/`** and **naming convention** doc (screen ↔ pencil ↔ HTML ↔ app route)
- [ ] Create **initial `.pencil`** files for home + novel detail (mobile + tablet artboards per file where useful)
- [ ] Build **shared components** in Pencil for section headers, nav, primary actions, card tiles—match **PRD type roles**
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

---

## Files to reference

- **Design:** `reference/` HTML screens (especially `reference/midnight_satin_prd.html` for type roles); **`reference/pencil/*.pencil`** once added (editable source for unification)
- **Tokens / Tailwind:** `tailwind.config.ts` (`fontFamily.display|header|body|ui|script`), `src/app/layout.tsx` (Next font variables wired to CSS)
- **Feature components:** `src/app/_components/` (and `author/`, `reading-room/`, `profile/` subfolders)
- **Responsive:** `src/lib/responsive/`
- **Back navigation samples:** `novel-detail-header.tsx`, `reading-room/reading-hud.tsx`, `vault/page.tsx`, `author/author-study-header.tsx`, `novel/[novelId]/paperback/paperback-page-shell.tsx`, `updates/[slug]/back-button.tsx`, `novel/[novelId]/reviews/page.tsx`, `cast-gallery-modal.tsx`
- **Section / actions:** `section-view-all.tsx`, `current-affairs-section.tsx`, `the-latest-section.tsx`, `author/trophy-case.tsx`, `players-section.tsx`, `reviews-section.tsx`, `synopsis-section.tsx`, `chapter-list.tsx`
- **Stars / cards:** `rating-display.tsx`, `review-card.tsx`, `novel-card.tsx`, `library-catalog.tsx`

---

*Update this document when the catalog gains new primitives, when major screens finish migration, or when `reference/pencil/` and HTML are reconciled.*
