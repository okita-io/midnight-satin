# Subagent directories

This directory defines **subagents** for the Midnight Satin project. Each subdirectory corresponds to one agent role. Use it to:

1. **Assign work** — Delegate tasks to the subagent whose scope matches (see main [README](../README.md) section “Subagents and parallel task division”).
2. **Store skills** — Place agent-specific skills here (e.g. `SKILL.md`, `reference.md`) so that when you invoke this subagent, it has the right instructions. You can also keep skills in `.cursor/skills/` and reference them from the subagent’s README.
3. **Run in parallel** — Backend and frontend (and testing, MCP-admin) can run in parallel once dependencies are met; see the “Parallel execution order” section in the main README.

## Subagents

| Directory | Role | Summary |
|-----------|------|---------|
| [frontend](frontend/) | Frontend | Design system, shared components, all screens (Boudoir, Library, Novel Detail, Reading Room, Cast Gallery, Author’s Study, Vault, Profile, Comments) |
| [backend-data](backend-data/) | Backend data | Schema, types, content fetching, cache, blob |
| [backend-auth](backend-auth/) | Backend auth | Login, register, session, middleware |
| [backend-payments](backend-payments/) | Backend payments | Purchase flow, webhook, credit grant |
| [backend-features](backend-features/) | Backend features | Bookmarks, reading progress, Veil unlock, endorsements, follow, comments data |
| [mcp-admin](mcp-admin/) | MCP & admin | MCP endpoint, admin dashboard CRUD |
| [testing](testing/) | Testing | Property-based and unit tests, generators |

Each subdirectory contains a **README.md** with task scope, skills to load, and references to specs. Add skill files (e.g. `SKILL.md`) in the subdirectory or link to `.cursor/skills/<name>/` from that README.
