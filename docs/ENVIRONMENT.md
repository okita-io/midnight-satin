# Environment variables

Copy `.env.example` → `.env.local` for local development. On Vercel, set the same keys per environment (Preview / Production). Never commit secrets.

## Required for a working app

| Variable | Service | Used for |
|----------|---------|----------|
| `POSTGRES_URL` | Neon / Vercel Postgres | All persistence |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Client SDK |
| `CLERK_SECRET_KEY` | Clerk | Server SDK |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk | `/api/webhooks/clerk` verification |

Without Postgres + Clerk, reader sessions and catalog data will not work as designed.

## Strongly recommended

| Variable | Service | Used for |
|----------|---------|----------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | Uploads (admin / MCP / seed blobs) |
| `KV_REST_API_URL` | Vercel KV | Cache (optional; app degrades gracefully) |
| `KV_REST_API_TOKEN` | Vercel KV | Cache auth |
| `STRIPE_SECRET_KEY` | Stripe | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client checkout |
| `MCP_API_KEY` | App | `/api/mcp` agent access |

## Feature flags

| Variable | Default (example) | Effect |
|----------|-------------------|--------|
| `NEXT_PUBLIC_PAPERBACK_ENABLED` | `false` | Show paperback surfaces |
| `NEXT_PUBLIC_PAPERBACK_PURCHASE_ENABLED` | `false` | Enable live paperback Stripe buy |

## Clerk routing

| Variable | Typical value |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |

## Optional / specialized

| Variable | When needed |
|----------|-------------|
| `STRIPE_PRICE_POUCH` / `_HANDFUL` / `_CHEST` / `_ROYAL` | Prefer Dashboard price IDs over ad-hoc amounts |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Legacy password-reset emails |
| `NEXT_PUBLIC_APP_URL` | Absolute links in reset emails |
| `REPLICATE_API_TOKEN` | Romance Factory image generation scripts |
| `ENV_FILE` / `DOTENV_CONFIG_PATH` | Point seed/import scripts at a non-default env file |

## Deployment checklist

1. Create Neon DB (or Vercel Postgres) → set `POSTGRES_URL`
2. Apply `src/lib/db/schema.sql` (or migrations through latest) on that DB
3. Apply `scripts/migrations/010_add_clerk_user_id.sql` if schema was applied before Clerk
4. Create Clerk application → keys + webhook to `/api/webhooks/clerk`
5. Create Blob store → `BLOB_READ_WRITE_TOKEN`
6. (Optional) Create KV → REST URL + token
7. Stripe keys + webhook endpoints
8. Set feature flags intentionally for production
9. Seed content (`db:seed`, news, devblog, Romance Factory import) as needed

## Script targeting

Seed and import scripts load `.env.local` by default. To hit production Neon without swapping local files:

```bash
ENV_FILE=.env.production.local npm run db:seed:news
```

Confirm the masked host printed by the script matches the intended Neon instance.
