# Midnight Satin — Documentation

Living reference for the Midnight Satin platform: stack, infrastructure, auth, and environment configuration. Generated from a codebase audit (July 2026); update these docs when integrations change.

| Doc | What it covers |
|-----|----------------|
| [TECH_STACK.md](./TECH_STACK.md) | Core framework, libraries, app layout, scripts |
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Neon/Postgres, Blob, KV, Stripe, email, AI, MCP |
| [AUTH.md](./AUTH.md) | Clerk integration, route matrix, admin promotion, legacy cutover |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Env var reference and deployment checklist |
| [E2E.md](./E2E.md) | Playwright UI visibility suite (guest + auth-gated) |

**Launch program:** [`.kiro/specs/launch-prep/tasks.md`](../.kiro/specs/launch-prep/tasks.md) — Clerk finish, legacy strip, security, Playwright, go-live.

Design UI specs live in [`reference/`](../reference/). Product requirements and task tracking live under [`.kiro/specs/`](../.kiro/specs/). Agent workflow notes are in [`AGENTS.md`](../AGENTS.md) and [`.agents/`](../.agents/).
