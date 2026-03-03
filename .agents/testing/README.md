# Testing subagent

**Scope:** Property-based tests (fast-check), unit tests, and component tests. Maintains test generators for domain types and ensures each correctness property in the design doc has a corresponding test.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Property-based testing (fast-check) | Properties 1–26 from design doc; generators; tags |
| Vitest, React Testing Library | Unit and component tests, test runner config |

## Task scope (from `tasks.md`)

- 1.3 — Property 1 (entity storage round-trip)
- 2.3, 2.4 — Properties 7, 8, 9, 10 (auth, access control, session)
- 4.2 — Property 13 (navigation links)
- 6.2 — Property 12 (current reading identification)
- 7.3 — Properties 14, 15 (chapter access, first unread)
- 8.4, 8.5 — Properties 11, 16, 2, 3 (reading progress, Veil, unlock)
- 10.3 — Properties 4, 5 (endorsements, trophy)
- 11.3 — Properties 17, 18 (follow, bibliography)
- 12.3 — Property 6 (payment credit invariant)
- 13.3 — Properties 19, 20, 21, 22, 24 (MCP, admin analytics)
- 14.4 — Properties 25, 26 (comments lifecycle, likes)

Plus unit/component tests for components and actions as needed.

## Reference

- Design doc: Correctness Properties, Testing Strategy, Test Organization (`.kiro/specs/midnight-satin-platform/design.md`)
- Generators: `src/__tests__/generators/` (author, novel, chapter, character, reader, credit-pack)
- Tag format: `Feature: midnight-satin-platform, Property N: <description>`
