# End-to-end tests (Playwright)

Launch UI visibility suite for Midnight Satin. Asserts critical chrome is **present, visible, and in viewport** — not pixel-perfect vs `reference/`.

## Prerequisites

1. Dependencies: `npm install` (includes `@playwright/test` and `@clerk/testing`)
2. Browser: `npx playwright install chromium`
3. App env in `.env.local`: at least `POSTGRES_URL` for catalog screens; Clerk **test** keys for auth-gated projects
4. Seeded content for full coverage: `npm run db:seed` (optional `npm run db:seed:news`)
   - Without novels, Library/Boudoir empty-state paths still pass; Novel Detail / Reading Room / Author Study **skip** until the catalog is seeded and Neon credentials work

## Commands

| Script | What it runs |
|--------|----------------|
| `npm run test:e2e` | All Playwright projects (guest mobile + desktop, auth) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:guest` | Guest/public screens only |

By default Playwright starts `npm run dev` on `http://127.0.0.1:3000` (reuses an already-running server locally).

Point at a Preview deployment:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e:guest
```

## Projects

| Project | Coverage |
|---------|----------|
| `chromium-mobile` | Guest screens at 390×844 |
| `chromium-desktop` | Same guest specs at 1280×800 |
| `clerk-setup` + `auth-mobile` | Clerk testing token + protected-route / sign-in chrome |

Auth e2e requires `pk_test_` / `sk_test_` keys. Production keys are skipped.

## Layout

```
e2e/
  global.setup.ts          # clerkSetup()
  helpers/visibility.ts    # viewport asserts + nav helpers
  guest/public-screens.spec.ts
  auth/gated-screens.spec.ts
playwright.config.ts
```

## Task tracking

See `.kiro/specs/launch-prep/tasks.md` §5.6–5.10.
