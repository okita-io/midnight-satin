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

### Notes

- The lockfile is `package-lock.json` — use **npm**, not pnpm/yarn.
- ESLint has pre-existing warnings (unused vars, `<img>` vs `<Image />`, unescaped entities). These are in scaffolded code and not regressions.
- No external services (databases, Docker, Redis) are needed at this stage. Vercel Postgres/Blob/KV and Stripe are planned but cloud-hosted; they will require env vars when implemented.
- Design reference HTML files live in `reference/`. The always-applied Cursor rule `.cursor/rules/midnight-satin-design.mdc` enforces adherence to the design system.
- The `.kiro/specs/` directory contains requirements, design docs, and task tracking. See `README.md` for the full agentic development workflow.
