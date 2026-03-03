# MCP-admin subagent

**Scope:** MCP HTTP endpoint for content agents and Admin Dashboard: MCP tools (create/list/update for authors, series, novels, chapters, characters), API key auth, and admin CRUD screens for content and users.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| MCP (Model Context Protocol) | Tool definitions, request/response shape, API key authentication |
| Next.js API routes, Vercel Postgres | `/api/mcp` route, admin layout and pages |

## Task scope (from `tasks.md`)

- 13.1 — `/api/mcp` route, create_author, create_series, create_novel, create_chapter, create_character, list_content, update_content; input validation; API key auth
- 13.2 — Admin layout, dashboard overview, CRUD for authors, series, novels, chapters, characters, users; comment moderation (hide/soft-delete); optional featured/trending controls

## Dependencies

- Requires **backend-data** (schema, content tables).
- Requires **backend-auth** (admin role check for dashboard).

## Reference

- Requirements: 12.1–12.9, 13.1–13.7 in `.kiro/specs/midnight-satin-platform/requirements.md`
- Design doc: MCP Interface section, admin routes
- Stitch/config: `.kiro/settings/mcp.json` for design MCP
