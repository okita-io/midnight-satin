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

**Route protection:** `src/proxy.ts` protects `/profile`, `/vault`, `/admin` via `auth.protect()`.

## UI

| Piece | Location |
|-------|----------|
| `ClerkProvider` + noir appearance | `layout.tsx`, `clerk-appearance.ts` |
| Sign-in / sign-up | `/sign-in`, `/sign-up` |
| Header controls | `clerk-auth-controls.tsx` |
| Auth prompts | `auth-prompt.tsx`, `profile-auth-prompt.tsx` |
| Logout | Clerk `SignOutButton` (+ `logoutReader` server action) |

Legacy `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` redirect to Clerk.

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
- [ ] Create **production** Clerk instance (`clerk doctor` still warns: prod not set)
- [ ] Set `CLERK_WEBHOOK_SIGNING_SECRET` and register endpoint `https://<domain>/api/webhooks/clerk` (events: `user.created`, `user.updated`, `user.deleted`)
- [ ] Sync Clerk keys + webhook secret to Vercel Production/Preview env
- [ ] Remove leftover `password.ts` / `password-reset.ts` / Resend reset tables after legacy accounts are linked or retired
- [ ] Confirm admin gates still use `readers.role === 'admin'`

## Related files

```
src/proxy.ts
src/lib/auth/clerk-reader.ts
src/lib/auth/clerk-appearance.ts
src/lib/auth/session.ts
src/app/actions/auth.ts
src/app/api/webhooks/clerk/route.ts
scripts/migrations/010_add_clerk_user_id.sql
```
