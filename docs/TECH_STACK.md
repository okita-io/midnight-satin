# Tech Stack

Midnight Satin is a **single Next.js 16 monolith** (App Router). There is no separate backend or dashboard package — API routes, server actions, admin UI, and reader UI all live at the repo root.

## Core

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | Next.js `16.1.6` | App Router, React Server Components |
| UI | React `19.2.3` | Client components where interactivity needs it |
| Language | TypeScript `^5` | Strict types for DB rows in `src/lib/db/types.ts` |
| Styling | Tailwind CSS `^3.4.19` | Design tokens in `src/app/globals.css` / `src/lib/design-tokens.ts` |
| Package manager | **npm** | Lockfile: `package-lock.json` |
| Hosting | Vercel | Zero-config Next.js deploy (no `vercel.json`) |
| Tests | Vitest + fast-check + Testing Library | `npm run test` |

## Product surface (routes)

| Area | Paths |
|------|--------|
| Reader | `/` (Boudoir), `/library`, `/novel/[novelId]`, `/novel/.../read/[chapterId]`, `/vault`, `/profile`, `/updates` |
| Author | `/author/[authorId]` |
| Auth (Clerk) | `/sign-in`, `/sign-up` |
| Auth (legacy) | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` |
| Admin | `/admin/*` (authors, novels, series, chapters, characters, comments, users) |
| API | `/api/mcp`, `/api/webhooks/clerk`, `/api/webhooks/stripe`, `/api/webhooks/payment` |

## Integration map

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App (Vercel)                      │
│  Pages · Server Actions · API routes · Admin                 │
└───────┬──────────┬──────────┬──────────┬──────────┬─────────┘
        │          │          │          │          │
   ┌────▼────┐ ┌───▼───┐ ┌───▼───┐ ┌────▼────┐ ┌──▼───┐
   │  Neon   │ │ Blob  │ │  KV   │ │  Clerk  │ │Stripe│
   │ Postgres│ │ images│ │ cache │ │  auth   │ │ pay  │
   └─────────┘ └───────┘ └───────┘ └────┬────┘ └──────┘
                                        │
                                   webhook → readers
```

Deep dives: [INFRASTRUCTURE.md](./INFRASTRUCTURE.md), [AUTH.md](./AUTH.md).

## Key packages

| Package | Role |
|---------|------|
| `@clerk/nextjs` | Authentication (in progress; see AUTH.md) |
| `@vercel/postgres` | Neon-backed SQL (`sql` tagged templates) |
| `@vercel/blob` | Public image storage |
| `@vercel/kv` | Short-TTL cache (optional locally) |
| `@vercel/analytics` / `@vercel/speed-insights` | Product analytics / Web Vitals |
| `stripe` | Credit packs + paperback checkout |
| `resend` | Password-reset email (legacy auth) |
| `replicate` | AI image generation (import scripts) |
| `bcryptjs` / `jose` | Legacy password + JWT session (being replaced by Clerk) |
| `react-markdown` | News / blog article bodies |

## Source layout

```
src/
  app/                 # App Router pages, layouts, server actions, API
  app/actions/         # Server actions (auth, unlock, reviews, admin, …)
  app/api/             # MCP + webhooks
  lib/
    auth/              # Clerk bridge, session helpers, legacy password reset
    db/                # schema.sql, types, query helpers
    blob.ts            # Vercel Blob wrapper
    cache.ts           # Vercel KV wrapper
    stripe/            # Credit pack config
    mcp/               # MCP content API data layer
  __tests__/           # Vitest + property tests
scripts/
  migrations/          # Ordered SQL migrations (manual apply)
  setup-db.mjs         # Schema apply / check
  seed-*.mjs           # Seed & import tooling
reference/             # Design HTML mocks + PRD
```

## Common scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local server (port 3000) |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `test` | ESLint / Vitest |
| `npm run db:check` | Verify DB connectivity |
| `npm run db:schema` | Apply `src/lib/db/schema.sql` |
| `npm run db:seed` | Placeholder novel seed |
| `npm run db:blobs` | Upload seed images to Blob, rewrite URLs |
| `npm run db:seed:news` / `db:seed:devblog` | News / editorial seeds |
| `npm run import:romance-story` | Romance Factory → Neon + Replicate images |
| `npm run preview:reference` | Serve design mocks on :3333 |

## Design system

UI must follow **Tactile Noir Luxury** specs in `reference/`:

- Gold `#D4AF37`, void `#050505`, surface `#121212`, burgundy `#800020`
- Fonts: Playfair Display, Cinzel, Literata, Marcellus
- Per-screen HTML mocks (Boudoir, Reading Room, Vault, Login, etc.)

See `.cursor/rules/midnight-satin-design.mdc`.

## What is intentionally not in the stack

- **No ORM** — raw SQL via `@vercel/postgres`
- **No automated migration runner** — numbered files under `scripts/migrations/`
- **No CI workflows** in-repo (no `.github/workflows` at audit time)
- **No Docker** — Vercel + Neon + Blob + KV
