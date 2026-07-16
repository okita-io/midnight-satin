# Infrastructure

How Midnight Satin uses Vercel platform services and third-party APIs. Connection strings and tokens are documented in [ENVIRONMENT.md](./ENVIRONMENT.md).

## Neon / Vercel Postgres

**What:** Primary application database. On Vercel, “Postgres” storage is Neon-backed; the app talks to it through `@vercel/postgres` using `POSTGRES_URL`.

**Client:** `src/lib/db/index.ts` re-exports `sql` and small reader/password-reset helpers. Most features issue tagged-template SQL directly in server actions or lib modules.

**Schema:**

| File | Role |
|------|------|
| `src/lib/db/schema.sql` | Canonical full schema (~17 tables) |
| `src/lib/db/schema-auth.sql` | Minimal auth bootstrap variant |
| `scripts/migrations/*.sql` | Incremental changes applied manually in order |

**Core tables (domain):**

| Table | Purpose |
|-------|---------|
| `author_profiles`, `series`, `novels`, `chapters`, `characters` | Catalog / content |
| `readers` | App user profile, credits, role; `clerk_user_id` links Clerk |
| `reading_progress`, `reader_bookmarks`, `author_follows` | Reader state |
| `credit_transactions`, `chapter_unlocks` | Credit economy |
| `comments`, `comment_likes`, `novel_reviews`, `review_likes` | Social |
| `processed_payment_events`, `paperback_orders` | Payments idempotency / orders |
| `password_reset_tokens`, `password_reset_log` | Legacy password reset |
| `news_articles` | `/updates` content |

**Ops:**

```bash
npm run db:check          # connectivity
npm run db:schema         # apply schema.sql (see script warnings)
npm run db:seed           # placeholder content
ENV_FILE=.env.production.local npm run db:seed:news
```

Migrations are **not** auto-run on deploy. Apply new files from `scripts/migrations/` against the target Neon database before shipping code that depends on them (e.g. `010_add_clerk_user_id.sql`).

**Risks:** Schema drift if migrations are skipped; `db:setup` is destructive (schema + seed) — never run against production casually.

---

## Vercel Blob

**What:** Public object storage for images (covers, portraits, avatars).

**Client:** `src/lib/blob.ts`

- `uploadImage(body, { prefix, filename, contentType })` → public URL
- `deleteBlob(urlOrPathname)`
- Allowed types: JPEG, PNG, WebP, GIF
- Path pattern: `<prefix>/<uuid>.<ext>` with `access: "public"`

**Prefixes in practice:** `covers`, `portraits`, `avatars`.

**Env:** `BLOB_READ_WRITE_TOKEN`

**Seed path:** `npm run db:blobs` uploads `public/seed/images/` and rewrites DB URLs (`scripts/upload-seed-blobs.mjs`).

**Related:** Romance Factory import can generate art via Replicate, then store under `public/images/generated/` or Blob depending on workflow.

---

## Vercel KV

**What:** Redis-compatible cache for hot reads (featured / trending / author profiles).

**Client:** `src/lib/cache.ts`

- TTL default **300s**
- Keys: `ms:featured`, `ms:trending`, `ms:author:<id>`
- If `KV_REST_API_URL` / `KV_REST_API_TOKEN` are missing, cache calls no-op and the app hits Postgres

Safe for local dev without KV.

---

## Stripe

**What:** Credit pack purchases and optional paperback checkout.

**Config:** `src/lib/stripe/config.ts` — packs `pouch` / `handful` / `chest` / `royal` with optional `STRIPE_PRICE_*` price IDs (falls back to ad-hoc pricing if unset).

**Flows:**

| Flow | Entry | Webhook / persistence |
|------|--------|------------------------|
| Credits | `src/app/actions/purchase-credits.ts` | Payment webhook + `credit_transactions` / `processed_payment_events` |
| Paperback | `src/app/actions/paperback.ts` | `/api/webhooks/stripe` → `paperback_orders` (idempotent on `stripe_session_id`) |

**Feature flags:**

- `NEXT_PUBLIC_PAPERBACK_ENABLED` — show paperback UI
- `NEXT_PUBLIC_PAPERBACK_PURCHASE_ENABLED` — enable live Stripe checkout

Both default to `false` in `.env.example`.

---

## Resend (email)

**What:** Transactional email for the **legacy** password-reset flow.

**Client:** `src/lib/auth/resend.ts` — branded HTML reset emails.

**Env:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, optional `NEXT_PUBLIC_APP_URL` for link base.

Once Clerk fully owns auth (including “forgot password”), Resend may be removable. See [AUTH.md](./AUTH.md).

---

## Replicate (AI images)

**What:** Offline / script-time image generation (e.g. Recraft v4) for covers and character art during Romance Factory import.

**Not** a runtime dependency of the Next.js request path for readers. Env: `REPLICATE_API_TOKEN`. Scripts: `scripts/import-romance-factory-story.mjs`, `pull-generated-images.mjs`, etc.

---

## MCP content API

**What:** Authenticated HTTP API for AI agents to create/list/update authors, series, novels, chapters, characters.

**Route:** `src/app/api/mcp/route.ts`  
**Data:** `src/lib/mcp/mcp-data.ts`  
**Auth:** `Authorization: Bearer <MCP_API_KEY>` or `X-API-Key` (falls back to `API_KEY` in some paths)

Treat `MCP_API_KEY` as a privileged secret; there is no fine-grained RBAC beyond the shared key.

---

## Analytics

- `@vercel/speed-insights` mounted in root layout
- `@vercel/analytics` installed (platform-side / optional component)

---

## Deployment shape

| Concern | Status |
|---------|--------|
| Host | Vercel (Next.js) |
| DB | Neon via Vercel Postgres / `POSTGRES_URL` |
| Assets | Vercel Blob |
| Cache | Vercel KV (optional) |
| Auth | Clerk (migration in progress) |
| Payments | Stripe + webhooks |
| CI | None in-repo at audit time |
| `vercel.json` | Not present (defaults) |

**Webhook endpoints to configure in vendor dashboards:**

1. Clerk → `https://<host>/api/webhooks/clerk` (`user.created` / `user.updated` / `user.deleted`)
2. Stripe → `https://<host>/api/webhooks/stripe` (and any payment webhook already wired under `/api/webhooks/payment`)
