# Backend-auth subagent

**Scope:** Authentication and session: password hashing, session management, auth Server Actions, Edge middleware for protected routes, login/register pages and auth-prompt modal.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Authentication & session | Login, registration, HTTP-only cookies, redirect to intended page, 200-credit welcome bonus |
| Next.js App Router | Middleware, Server Actions, auth API routes |

## Task scope (from `tasks.md`)

- 2.1 — password.ts, session.ts, auth actions, middleware.ts
- 2.2 — Login page, register page, auth-prompt.tsx; validation and error messages; redirect on success

## Dependencies

- Requires **backend-data**: `readers` table and types must exist.

## Reference

- Requirements: 9.x in `.kiro/specs/midnight-satin-platform/requirements.md`
- Auth flow: `.kiro/specs/midnight-satin-platform/design.md` (Authentication Flow)
