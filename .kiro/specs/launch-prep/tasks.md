# Launch Prep: Streamline, Harden, Finish Clerk, Ship

## Overview

Post-build launch program for Midnight Satin. Core product features are largely implemented (see `.kiro/specs/midnight-satin-platform/tasks.md`). This list closes the gap between “works in development” and “safe to launch”: finish Clerk in production, remove legacy auth, harden security, cover edge cases, add Playwright UI visibility coverage, streamline the surface area, and run a go-live checklist.

**Status legend:** `[ ]` not started · `[-]` in progress · `[x]` verified complete  
**Related docs:** [`docs/AUTH.md`](../../../docs/AUTH.md), [`docs/INFRASTRUCTURE.md`](../../../docs/INFRASTRUCTURE.md), [`docs/ENVIRONMENT.md`](../../../docs/ENVIRONMENT.md)

**Current baseline (as of this list):**
- Clerk provider, `/sign-in` `/sign-up`, webhook route, and `clerk-reader` → Neon bridge exist
- `src/proxy.ts` uses `clerkMiddleware` + `auth.protect()` for `/profile`, `/admin`, `/vault`; webhooks explicitly excluded
- `/admin` also requires Neon `readers.role === 'admin'` (layout + actions)
- Legacy `/auth/*` pages still redirect to Clerk (stubs kept briefly); password/Resend/bcrypt/jose **removed from app code**
- Production Clerk instance / webhook secret / Vercel env sync still incomplete per `docs/AUTH.md`
- Vercel Blob store `midnight-blob` (`store_BA84nTw9y31mmhrL`, region `sfo1`) provisioned and linked to project `midnight-satin`; `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` present locally — store is still empty (assets not migrated yet)

---

## Tasks

- [-] 1. Finish Clerk for production
  - [ ] 1.1 Create and verify production Clerk application
    - Create a production Clerk instance (not development-only); run `npx clerk doctor` until prod warnings are cleared
    - Configure allowed origins / redirect URLs for the live domain and Vercel preview URLs
    - _Docs: docs/AUTH.md production checklist_
  - [ ] 1.2 Sync Clerk env to Vercel Preview + Production
    - Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, sign-in/up URLs, fallback redirects
    - Confirm Preview and Production use the correct instance keys (no cross-env leakage)
    - _Docs: docs/ENVIRONMENT.md_
  - [ ] 1.3 Register and verify Clerk webhooks in production
    - Endpoint: `https://<production-domain>/api/webhooks/clerk`
    - Events: `user.created`, `user.updated`, `user.deleted`
    - Confirm signature verification with production `CLERK_WEBHOOK_SIGNING_SECRET`; smoke-test create/update/delete sync into Neon `readers`
  - [x] 1.4 Harden Clerk route protection in `src/proxy.ts`
    - Review matcher: ensure webhook routes (`/api/webhooks(.*)`) are not blocked by `auth.protect()`
    - Decide whether unlock/purchase/comment/review flows need Edge protection in addition to server-action `getSession()` checks
    - Protect any remaining authenticated page surfaces (e.g. paperback success if session-required)
    - Document the public vs protected route matrix in `docs/AUTH.md`
  - [x] 1.5 Confirm admin authorization path
    - Verify `/admin` requires Clerk auth **and** `readers.role === 'admin'` (not Clerk-org-only)
    - Document how the first admin is promoted in Neon (SQL or seed script)
    - Add a regression test or property covering non-admin signed-in users cannot call admin actions
  - [x] 1.6 Clerk UX polish for launch brand
    - Verify `clerk-appearance.ts` matches Tactile Noir Luxury on sign-in/up (mobile + desktop)
    - Confirm UserButton / SignOut paths clear Neon session cookie helpers and redirect cleanly
    - Ensure auth prompts deep-link back to intended content (`redirect_url` / return paths)

- [-] 2. Strip legacy authentication
  - [-] 2.1 Inventory and migrate remaining password-backed readers
    - Query Neon for `readers` with `password_hash IS NOT NULL` and/or `clerk_user_id IS NULL`
    - Decide policy: force re-register via Clerk, email invite, or one-time link-by-email on first Clerk login (already partially implemented in `clerk-reader.ts`)
    - Produce a short runbook for linking legacy accounts before cutover
  - [-] 2.2 Remove legacy auth UI and routes
    - Delete or permanently replace `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` (redirect stubs OK only during a short deprecation window)
    - Remove dead form components that only served JWT login/register
    - Update nav/copy/links that still mention “password” or old auth URLs
  - [x] 2.3 Remove legacy auth server code
    - Delete `src/lib/auth/password.ts`, `password-reset.ts`, `resend.ts` (if unused), `src/app/actions/password-reset.ts`
    - Remove deprecated `loginFormAction` / `registerFormAction` once no imports remain
    - Simplify `session.ts` / `deleteSession()` — drop JWT cookie (`midnight-satin-session`) once confirmed unused
  - [x] 2.4 Remove legacy auth dependencies and schema
    - Remove `bcryptjs`, `jose`, `@types/bcryptjs` from `package.json` when unused
    - Remove or archive Resend if only used for password reset; drop `RESEND_*` from `.env.example` if retired
    - Add migration to drop `password_reset_tokens`, `password_reset_log`, and eventually `readers.password_hash` (after cutover confirmed)
    - Delete or rewrite `.legacy` password-reset tests; remove password-hash property tests that no longer apply
  - [x] 2.5 Update platform docs and old specs
    - Mark password-recovery Resend spec as superseded by Clerk
    - Refresh `docs/AUTH.md`, `docs/ENVIRONMENT.md`, README auth bullets
    - Update `.kiro/specs/midnight-satin-platform/tasks.md` note that Req 2 JWT auth is historically complete but superseded

- [ ] 3. Security hardening
  - [ ] 3.1 AuthZ audit of all server actions and API routes
    - Inventory every `"use server"` action and `/api/*` route; classify: public / signed-in / admin / webhook / MCP
    - Ensure mutating actions call `getSession()` / `requireSession()` and scope by `readerId` (no IDOR on bookmarks, unlocks, reviews, comments, follows)
    - Ensure admin actions all go through `checkAdminSession` (or equivalent) and fail closed
  - [ ] 3.2 Webhook security
    - Stripe: verify signature required; reject missing/invalid secrets with 400; confirm idempotency on `processed_payment_events` / `paperback_orders`
    - Clerk: same for signing secret; soft-delete behavior does not orphan credits unsafely without a documented policy
    - Confirm webhook routes are excluded from Clerk `auth.protect()` and do not rely on session cookies
  - [ ] 3.3 MCP API hardening
    - Require `MCP_API_KEY` in production (fail closed if unset)
    - Add basic rate limiting or abuse notes; rotate key procedure in docs
    - Ensure MCP cannot escalate to admin reader role or grant arbitrary credits without explicit ops design
    - Audit logging for create/update operations (who/when/what)
  - [ ] 3.4 Secrets and env hygiene
    - Audit Vercel env for leaked test keys in production; ensure Stripe live vs test keys match environment
    - Confirm `.env*` is gitignored; no secrets in docs or scripts defaults
    - Rotate any keys that were shared in chat/logs historically if applicable
  - [ ] 3.5 HTTP / browser hardening pass
    - Review security headers (CSP baseline, frame ancestors, referrer policy) via `next.config` or Vercel
    - Confirm cookies used by Clerk are Secure/HttpOnly as provided by Clerk; remove any custom insecure cookies
    - XSS pass on markdown news rendering (`react-markdown` allowlist / no raw HTML unless sanitized)
  - [ ] 3.6 Payment and credit integrity
    - Re-verify unlock / endorsement / purchase invariants under concurrent requests (row locks still correct)
    - Ensure credit grants only via verified Stripe webhook (never trust client-reported success alone)
    - Confirm paperback feature flags cannot be bypassed by hitting server actions when disabled

- [ ] 4. Streamline product surface for launch
  - [ ] 4.1 Feature flag launch policy
    - Decide paperback: hidden / coming soon / live; set `NEXT_PUBLIC_PAPERBACK_*` accordingly in Production
    - Hide or gate unfinished admin screens that are unsafe for production operators
    - Document launch-scope features vs post-launch backlog
  - [ ] 4.2 Dead code and dependency cleanup
    - Remove unused components, `.agents` Clerk skill noise if not needed in repo (or gitignore / document purpose)
    - Audit `my-replicate-app/` — keep as tooling or move out of production app tree
    - Run unused-export / lint cleanup on auth and payment paths after legacy strip
  - [ ] 4.3 Migrate relevant assets into `midnight-blob`
    - Confirm Vercel Production/Preview have `BLOB_READ_WRITE_TOKEN` (and optionally `BLOB_STORE_ID`) for store `midnight-blob` / `store_BA84nTw9y31mmhrL`
    - Inventory image URLs in Neon: `novels.cover_image_url`, `characters.portrait_url`, `author_profiles.avatar_url` (and any news/article images) — classify local `/seed/...`, `/images/generated/...`, old Blob hosts, vs already-on-target
    - Upload seed + launch assets to the new store (prefixes `covers/`, `portraits/`, `avatars/`, or `seed/images/` via `npm run db:blobs` / extended scripts)
    - Rewrite DB rows to the new public Blob URLs (`*.public.blob.vercel-storage.com` for this store)
    - Re-point or re-run Romance Factory / Replicate import paths so new uploads land on `midnight-blob`, not local-only or a previous store
    - Smoke-check Boudoir, Novel Detail, Cast Gallery, Author Study images load from the new store; remove or leave-as-fallback unused local copies only after verification
    - Document the migration path in `docs/INFRASTRUCTURE.md` (store id, token env, upload scripts)
  - [ ] 4.4 Performance and asset streamlining
    - Replace critical-path `<img>` with `next/image` where beneficial (covers, portraits)
    - Confirm Blob URLs and ISR/caching still correct after image changes
    - Quick Lighthouse / Speed Insights pass on Boudoir, Novel Detail, Reading Room
  - [ ] 4.5 Content and empty-state readiness
    - Seed production Neon with launch novels, news, and author profiles
    - Verify empty states are on-brand when a section has no data
    - Confirm `/updates` and Boudoir “latest” content are production-appropriate (no placeholder lorem)
  - [ ] 4.6 Design fidelity spot-check vs `reference/`
    - Boudoir, Novel Detail, Reading Room, Vault, Login/Sign-in, Profile — mobile first
    - Fix only launch-blocking visual regressions (not a full redesign)

- [ ] 5. Edge-case and regression testing
  - [ ] 5.1 Update auth test suite for Clerk
    - Rewrite `auth-properties` / `access-control-properties` / `authentication-forms` for Clerk-backed sessions (mock `auth()` / bridge)
    - Remove or quarantine password-hash / Resend unit tests after legacy strip
    - Ensure all related Vitest suites pass
  - [ ] 5.2 Auth edge cases (manual + automated where practical)
    - Signed-out user hits protected route → Clerk sign-in → returns to intended URL
    - New Clerk user gets Neon row + welcome credits exactly once
    - Existing Neon email links to `clerk_user_id` without duplicating reader or double-granting credits
    - Clerk `user.deleted` webhook soft-unlinks; subsequent login recreates or restores per policy
    - Session expiry / sign-out clears access to unlock, purchase, profile
  - [ ] 5.3 Economy and paywall edge cases
    - Unlock with insufficient credits; unlock free chapter; double-submit unlock; concurrent unlocks
    - Stripe checkout cancel, success, duplicate webhook delivery, wrong webhook secret
    - Paperback disabled flags block purchase action even if URL guessed
  - [ ] 5.4 Social / content edge cases
    - Comment/review length limits, empty body, unauthenticated submit
    - Bookmark toggle race; follow idempotence; endorsement at trophy threshold boundary
    - Reading progress restore after refresh / chapter switch
  - [ ] 5.5 Admin and MCP edge cases
    - Non-admin Clerk user cannot mutate admin resources
    - MCP with bad/missing key → 401; valid key can CRUD content without breaking schema constraints
  - [ ] 5.6 Playwright setup and UI visibility suite
    - Add Playwright (`@playwright/test`) with config for local `npm run dev` (and optional Preview base URL)
    - Add npm scripts (e.g. `test:e2e`, `test:e2e:ui`); document how to run in `docs/` or README
    - Prefer stable selectors (`getByRole`, `getByLabel`, `data-testid` where needed); avoid brittle CSS-only chains
    - Assert critical UI is **present, visible, and in viewport** (not just in DOM): headings, primary CTAs, nav items, key imagery
    - Cross-check against `reference/` screen specs for launch surfaces (structure/labels, not pixel-perfect)
    - Mobile-first viewport (e.g. 390×844) plus one tablet/desktop breakpoint for responsive layouts
  - [ ] 5.7 Playwright — guest / public screens
    - **Boudoir (`/`):** brand/header, search (if shown), hero/featured, Current Affairs / High Society sections (or empty states), nav bar (Boudoir, Library, Vault, Profile)
    - **Library (`/library`):** catalog grid/list chrome, novel cards with title + cover visible, empty state when no results
    - **Novel Detail:** parallax/cover hero, title/author, synopsis, chapter list, cast/players entry, bookmark/share affordances, nav
    - **Reading Room (free chapter):** chapter content readable, HUD/progress controls visible when expected; Veil **not** shown for free chapters
    - **Author Study:** avatar, bio, bibliography/follow chrome
    - **Updates (`/updates`):** article list/cards; article detail when seeded
    - **404 / error:** themed not-found visible
  - [ ] 5.8 Playwright — auth-gated and commerce UI
    - Wire Clerk test helpers (`setupClerkTestingToken`, storageState / signed-in fixture); use **test** Clerk keys + `CLERK_TESTING_TOKEN` only
    - Guest on protected route sees Clerk sign-in (or redirect), not a blank page
    - Signed-in **Profile:** account chrome, bookmarks/progress sections (or empty states), sign-out control
    - **Vault:** credit packs / purchase UI visible when enabled; Coming Soon / gated state when paperback/credits flags dictate
    - **The Veil** on a locked chapter: blur/paywall chrome and unlock CTA visible; insufficient-credits messaging when applicable
    - Auth prompts (e.g. endorse / unlock while signed out) render expected copy + sign-in/up CTAs
    - Optional smoke: admin shell chrome for an admin-role test user (do not assert full CMS CRUD in launch suite)
  - [ ] 5.9 Playwright — assets and visual smoke
    - After Blob migration (4.3): covers/portraits/avatars on key pages load successfully (naturalWidth / response OK), no broken-image placeholders for seeded content
    - Soft visual baselines optional (Playwright screenshots) for Boudoir + Novel Detail mobile — treat as non-blocking unless CI is ready
  - [ ] 5.10 Checkpoint — full automated suite green
    - `npm run test` (Vitest) passes
    - `npm run test:e2e` (Playwright) passes against a seeded local or Preview environment
    - `npm run lint` reviewed (fix launch-blocking issues; track non-blocking separately)
    - `npm run build` succeeds with production env shape

- [ ] 6. Launch operations and go-live
  - [ ] 6.1 Production infrastructure checklist
    - Neon production DB schema + migrations through `010` (and any new legacy-drop migrations)
    - Blob store `midnight-blob` linked; `BLOB_READ_WRITE_TOKEN` in Vercel Production/Preview; asset migration (4.3) complete or explicitly deferred with local fallbacks
    - KV provisioned (or documented graceful no-cache); tokens in Vercel Production
    - Stripe live mode keys + webhooks pointed at production URLs
    - Domain DNS + HTTPS; Clerk production domain settings
  - [ ] 6.2 Observability and failure modes
    - Confirm Vercel Speed Insights / Analytics active
    - Define how to read Stripe + Clerk webhook failures (Vercel logs)
    - Document rollback: previous deployment + feature flags
  - [ ] 6.3 Legal / trust basics (launch-min)
    - Age gate / adult romance positioning if required for brand
    - Privacy policy + terms links in footer or profile (even if simple static pages)
    - Support contact path for billing issues
  - [ ] 6.4 Soft launch rehearsal
    - Deploy Preview with production-like env; run through: sign-up → read free chapter → unlock → buy credits (test mode) → review
    - Admin smoke: create/edit novel, upload cover to Blob
    - Re-run Playwright smoke (`npm run test:e2e`) against Preview if base URL is configured
    - Fix P0/P1 issues before promoting to Production
  - [ ] 6.5 Production cutover
    - Promote deployment; verify env; send Clerk + Stripe test events
    - Create/promote admin reader; verify `/admin`
    - Smoke production URLs on mobile Safari + Chrome
    - Announce launch; monitor logs/webhooks for 24–48h
  - [ ] 6.6 Post-launch hygiene
    - Close remaining non-blocking tasks into a backlog
    - Schedule removal of any temporary redirect stubs
    - Update `docs/` with final production architecture notes

---

## Suggested order of attack

1. **1.x + 3.1–3.2** — production Clerk + authZ/webhooks (blocks safe traffic)
2. **2.x** — strip legacy once prod Clerk + account-linking policy is solid
3. **5.1–5.5** — rewrite Vitest / edge cases while auth is fresh
4. **4.3** — migrate images into `midnight-blob` (can run in parallel once tokens are in Vercel)
5. **5.6–5.9** — Playwright UI visibility (after seed content; asset asserts after 4.3)
6. **4.x + 6.x** — streamline content/flags and go live
7. **3.3–3.6** — deepen hardening in parallel with soft launch if needed

## Out of scope (track separately)

- New narrative features / Romance Factory pipeline improvements
- Pixel-perfect visual regression across every breakpoint (launch suite is visibility + structure)
- Clerk Billing / Organizations (not required for reader credits model)
- Mobile native apps
