# Authentication

Midnight Satin uses **Clerk** for identity and **Neon `readers`** for app profile data (credits, role, reading social graph).

## Architecture

```
Browser
  └─ Clerk session (ClerkProvider + proxy.ts clerkMiddleware)
       └─ Server: auth() / currentUser()
            └─ ensureReaderForClerkUser()  →  Neon readers row
                 └─ SessionPayload { readerId, email, role, … }
```

**Bridge:** `src/lib/auth/clerk-reader.ts`

1. Read Clerk `userId` via `auth()`
2. Lookup `readers.clerk_user_id`
3. Else match legacy row by email and attach `clerk_user_id`
4. Else insert new reader (+ 200 welcome-bonus credits)
5. Webhook upsert: `POST /api/webhooks/clerk` on `user.created` / `user.updated`; soft-unlink on `user.deleted`

**Session helpers:** `getSession()` / `requireSession()` / `getCurrentReader()` — all Clerk-backed.

**Admin gate:** `src/lib/auth/admin.ts` — `readers.role === 'admin'` (not Clerk Organizations). Layout + mutations both enforce this.

## Route matrix

| Surface | Edge (`proxy.ts`) | App / action AuthZ | Notes |
|---------|-------------------|--------------------|-------|
| `/`, Library, Novel Detail, Reading Room, Author, Updates | Public | N/A | Content ISR |
| `/sign-in`, `/sign-up` | Public | N/A | Honors `?redirect_url=` (same-origin relative only) |
| `/profile`, `/vault` | `auth.protect()` | `getSession()` in pages/actions | Credits / library |
| `/admin/*` | `auth.protect()` | `requireAdminPage()` + `checkAdminSession()` | Must be Neon admin |
| Unlock / purchase / comment / review / bookmark / follow | Public pages | Server actions `getSession()` / `requireSession()` | Edge protect would break guest browsing; fail closed in actions |
| `/novel/.../paperback` + `/paperback/success` | Public | Checkout action requires session; success uses Stripe `session_id` | Not Edge-gated |
| `/api/webhooks/clerk`, `/api/webhooks/stripe`, `/api/webhooks/payment` | Explicitly **not** session-protected | Signature verification (Clerk / Stripe) | Never rely on cookies |
| `/api/mcp` | Public to Edge | `MCP_API_KEY` | Separate hardening (launch-prep 3.3) |
| Legacy `/auth/*` | Public | Redirect stubs → Clerk | Remove after cutover (task 2.2) |

## UI

| Piece | Location |
|-------|----------|
| `ClerkProvider` + noir appearance | `layout.tsx`, `clerk-appearance.ts` |
| Sign-in / sign-up | `/sign-in`, `/sign-up` (`forceRedirectUrl` from `redirect_url`) |
| Header controls | `clerk-auth-controls.tsx` (modal + current-path return) |
| Auth prompts | `auth-prompt.tsx`, `profile-auth-prompt.tsx` |
| Logout | Profile `logoutReader` (revokes Clerk + clears legacy JWT cookie); header `UserButton` Clerk sign-out |

## Promote first admin

After you have signed in once via Clerk (so a `readers` row exists with `clerk_user_id`):

```sql
-- By email
UPDATE readers
SET role = 'admin'
WHERE lower(email) = lower('you@example.com');

-- Or by Clerk user id
UPDATE readers
SET role = 'admin'
WHERE clerk_user_id = 'user_...';
```

Confirm: open `/admin` while signed in — non-admins are redirected to `/`. Mutations already return `{ error: "Forbidden" }` for non-admins.

## Legacy account linking (pre-cutover)

Policy: **link-by-email on first Clerk login** (already in `clerk-reader.ts`). Readers who sign up/in with the same email as an existing Neon row get `clerk_user_id` attached; credits and history are preserved. New emails create a new row + 200 welcome credits.

Inventory before dropping `password_hash`:

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE password_hash IS NOT NULL) AS with_password,
  COUNT(*) FILTER (WHERE clerk_user_id IS NULL) AS without_clerk,
  COUNT(*) FILTER (WHERE password_hash IS NOT NULL AND clerk_user_id IS NULL) AS password_only
FROM readers;
```

Cutover runbook:

1. Ask known password-only users to sign in once via Clerk with the **same email**.
2. Re-run inventory until `password_only = 0` (or accept force re-register for leftovers).
3. Apply `scripts/migrations/011_drop_password_reset_tables.sql`.
4. Later: `ALTER TABLE readers DROP COLUMN password_hash;` when confirmed unused.
5. Remove `/auth/*` redirect stubs (launch-prep 2.2).

## Database

Migration `scripts/migrations/010_add_clerk_user_id.sql` (applied on local Neon):

- `readers.clerk_user_id TEXT UNIQUE`
- `password_hash` nullable

## Env vars

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

Pull locally: `npx clerk env pull`

## Production checklist

- [x] Clerk linked (`romance-project`) + local keys
- [x] Neon `clerk_user_id` migration
- [x] `clerkMiddleware` in `src/proxy.ts`
- [x] Legacy auth UI redirected / removed
- [x] Clerk webhook route implemented
- [x] Admin gates use `readers.role === 'admin'` (layout + actions)
- [x] Public vs protected route matrix documented (this file)
- [ ] Create **production** Clerk instance (`clerk doctor` still warns: prod not set)
- [ ] Set `CLERK_WEBHOOK_SIGNING_SECRET` and register endpoint `https://<domain>/api/webhooks/clerk` (events: `user.created`, `user.updated`, `user.deleted`)
- [ ] Sync Clerk keys + webhook secret to Vercel Production/Preview env
- [x] Remove leftover `password.ts` / `password-reset.ts` / Resend app code (tables dropped via migration 011 after inventory)

## Related files

```
src/proxy.ts
src/lib/auth/clerk-reader.ts
src/lib/auth/clerk-appearance.ts
src/lib/auth/admin.ts
src/lib/auth/redirect.ts
src/lib/auth/session.ts
src/app/actions/auth.ts
src/app/api/webhooks/clerk/route.ts
scripts/migrations/010_add_clerk_user_id.sql
```
