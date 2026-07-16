# AGENTS.md

## Cursor Cloud specific instructions

This is a single **Next.js 16** monolith (App Router, React 19, TypeScript, Tailwind CSS). There are no separate backend/frontend/dashboard sub-projects despite references in user rules — everything lives at the repo root.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Unit tests | `npm run test` |
| E2E (Playwright) | `npm run test:e2e` (see `docs/E2E.md`) |

### Notes

- The lockfile is `package-lock.json` — use **npm**, not pnpm/yarn.
- ESLint has pre-existing warnings (unused vars, `<img>` vs `<Image />`, unescaped entities). These are in scaffolded code and not regressions.
- **Auth:** Clerk (`@clerk/nextjs`) for identity; Neon `readers.clerk_user_id` for app profile/credits. Keys via `npx clerk env pull`. Webhook: `POST /api/webhooks/clerk` (needs `CLERK_WEBHOOK_SIGNING_SECRET`).
- Neon Postgres is provisioned (see `.env.local` `DATABASE_URL` / `POSTGRES_URL`). Stripe and Blob remain planned/partial.
- Design reference: **Pencil** (`reference/pencil/`) is the editable source of truth; **HTML** mocks live in `reference/*.html`. When they disagree after a unification pass, **Pencil wins** until HTML is updated. Rule: `.cursor/rules/midnight-satin-design.mdc`. Regen: `reference/pencil/README.md`.
- Pencil screen artboards (mobile 390 + tablet 834) live in `reference/pencil/` — compose from `design_system.pen` / `pencil-tokens.mjs` helpers.
- The `.kiro/specs/` directory contains requirements, design docs, and task tracking. See `README.md` for the full agentic development workflow.
- Clerk skills live in `.agents/skills/clerk*` (installed via `npx skills add clerk/skills`).
