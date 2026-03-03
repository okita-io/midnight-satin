# Backend-data subagent

**Scope:** Database schema, TypeScript domain types, content fetching, caching (Vercel KV), and blob storage. Foundation used by all other backend and frontend agents.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Vercel Postgres / Blob / KV | Schema, queries, migrations, blob uploads, KV cache with TTL |
| TypeScript & domain types | Types aligned with design doc: AuthorProfile, Novel, Chapter, Character, Reader, etc. |

## Task scope (from `tasks.md`)

- 1.2 — Schema (`src/lib/db/schema.sql`), types (`types.ts`), index per design document
- 5.1 — Content fetching (getFeaturedNovels, getTrendingNovels), cache (KV 300s), blob helpers; ISR 60s strategy

## Reference

- Schema & types: `.kiro/specs/midnight-satin-platform/design.md` (SQL and TypeScript sections)
- Requirements: 10.x, 11.x in `.kiro/specs/midnight-satin-platform/requirements.md`
