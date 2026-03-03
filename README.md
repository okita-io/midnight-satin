# Midnight Satin

A premium romance reading web application — **Tactile Noir Luxury** experience. Readers discover and read AI-generated stories, unlock chapters with credits, and endorse characters. Built for agentic development: specs, design references, and agent skill requirements are documented so AI agents and subagents can contribute effectively.

## Tech stack

- **Runtime:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, design tokens in `globals.css`
- **Data:** Vercel Postgres, Vercel Blob (assets), Vercel KV (caching)
- **Auth:** Session-based (cookies/JWT), Edge middleware for protected routes
- **Payments:** Stripe (or configured Payment_Provider) for credit packs
- **Content:** AI-generated via MCP interface; admin dashboard at `/admin`
- **Testing:** Vitest, fast-check (property-based), React Testing Library

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Design reference files live in `reference/`; always implement screens to match the corresponding HTML mockups and the design system in `reference/midnight_satin_prd.html`.

## Project layout (reference)

- **`reference/`** — HTML design mockups and PRD (source of truth for UI)
- **`.cursor/rules/`** — Cursor rules (e.g. `midnight-satin-design.mdc`, always applied)
- **`.kiro/specs/midnight-satin-platform/`** — Requirements, design doc, tasks, correctness properties
- **`src/app/`** — Next.js App Router pages and layout
- **`scripts/`** — Utilities (e.g. `fetchStitchDesigns` for Stitch designs)

---

## Agentic development

This project is built with **AI agents and subagents** in mind. Specs, design files, and Cursor rules are structured so that agents can work on features, tests, and fixes with minimal ambiguity. The sections below define **required agent skills**, where to find them, and how to use them so each agent can perform optimally.

### How agents should use this repo

1. **Always respect the design system.** The rule in `.cursor/rules/midnight-satin-design.mdc` is always applied: implement screens using the reference HTML files in `reference/` and the palette/typography from the PRD (void black, gold, Literata/Playfair/Cinzel/Marcellus, mobile-first).
2. **Implement against the requirements.** Formal requirements and acceptance criteria are in `.kiro/specs/midnight-satin-platform/requirements.md`. The design doc (`.kiro/specs/midnight-satin-platform/design.md`) defines routes, components, server actions, data models, and correctness properties.
3. **Follow the task list.** Implementation tasks and property-test mapping are in `.kiro/specs/midnight-satin-platform/tasks.md`. When adding features, align with existing task numbering and property tags.
4. **Run and extend tests.** Use Vitest for unit/component tests and fast-check for property-based tests. New behavior that touches credits, auth, or content should be covered by the relevant correctness properties in the design doc.
5. **Check terminal and paths.** Run commands from the repo root unless a task specifies a subproject. Wait for command output before proceeding; the environment may be slow.

### Required agent skills (install and use)

Agents and subagents should have access to — or be instructed to apply — the following skills. Install or enable them so that the right skill is used for the right kind of work. Each skill should be **discoverable** (good description and trigger terms) and **scoped** (clear when to use it).

| Skill area | Purpose | When to use | Guidance for optimal use |
|------------|---------|-------------|---------------------------|
| **Next.js App Router & RSC** | Implement routes, layouts, React Server Components, Server Actions, and data fetching (ISR/SSR). | Adding or changing pages, API routes, server actions, or middleware. | Prefer Server Components and Server Actions; use ISR (60s) for Boudoir, Library, Novel Detail, Author Study; use dynamic SSR for Reading Room, Vault, Admin. Route structure is defined in `.kiro/specs/midnight-satin-platform/design.md`. |
| **Tailwind CSS & design tokens** | Apply the Tactile Noir Luxury design system: colors, typography, spacing, shadows, safe-area insets. | Styling any UI, creating or editing components, matching reference mockups. | Use design tokens from `reference/midnight_satin_prd.html` and `src/app/globals.css`. Mobile-first, max content width 448px (max-w-md), gold accents (#D4AF37), void (#050505), surface (#121212), burgundy (#800020). Sharp radii (2px/4px), gold-tinted shadows. |
| **TypeScript & domain types** | Keep types aligned with the data model and server contracts. | Defining or changing types, DB types, API/MCP request/response shapes. | Copy types from the design doc (`.kiro/specs/midnight-satin-platform/design.md`) for AuthorProfile, Novel, Chapter, Character, Reader, ReadingProgress, CreditTransaction, Comment, etc. Use consistent naming (e.g. `novelId`, `authorId`). |
| **Vercel Postgres / Blob / KV** | Implement data layer: queries, migrations, blob uploads, KV caching. | DB schema changes, content CRUD, asset uploads, caching featured/trending data. | Schema and indexes are in the design doc. Use `@vercel/postgres`, `@vercel/blob`, `@vercel/kv`. Credit-changing operations must run in transactions with row-level locking on reader balance. Cache frequently accessed data in KV with TTL 300s where specified. |
| **Authentication & session** | Implement login, registration, session lifecycle, and route protection. | Auth flows, protected routes, Edge middleware, welcome bonus (200 credits). | Email/password with secure hashing; HTTP-only session cookies. Redirect to intended page or Boudoir after login/register. Guest access: allow browse and free chapters; prompt to sign in for unlock, endorse, Vault. See requirements 9.x and design doc auth flow. |
| **MCP (Model Context Protocol)** | Implement or call the content-agent MCP interface and use Stitch for design assets. | Adding/updating MCP tools, content agent workflows, or fetching designs from Stitch. | MCP server at `/api/mcp`; API key auth. Tools: create_author, create_series, create_novel, create_chapter, create_character, list_content, update_content. Stitch MCP (see `.kiro/settings/mcp.json`) for design screens; use when syncing or referencing Stitch designs. |
| **Property-based testing (fast-check)** | Write and maintain property-based tests for correctness properties. | Adding or changing behavior that affects credits, auth, reading progress, unlocks, endorsements, comments, or admin. | Each correctness property in the design doc (Properties 1–26) should have a corresponding test. Use generators in `src/__tests__/generators/` for domain types. Tag tests: `Feature: midnight-satin-platform, Property N: <short description>`. Run property tests as part of CI. |
| **Accessibility (a11y)** | Meet WCAG 2.1 AA baseline: focus order, labels, contrast, semantics, modals. | Implementing or updating UI components, modals, navigation, Reading Room, Cast Gallery. | Requirement 21: focusable controls, visible focus, aria-label (or hidden text) for icon-only controls, semantic HTML (nav, main, header, footer, article). Focus trap in modals; restore focus on close. Contrast: text #EAEAEA on void #050505; gold on dark. |
| **Stripe / payment webhooks** | Implement credit purchase flow and webhook handling with idempotency. | Vault purchase flow, webhook route, credit grant, restore purchases. | Use Stripe Checkout (or configured provider); webhook for success/failure with idempotency to avoid duplicate credits. On success: add credits to balance, create credit_transaction (type `purchase`), optional coin-rain UI. Requirement 8.x. |
| **Cursor rules & skills** | Create or update Cursor rules and Agent Skills for this repo or for agents. | Adding project conventions, design reminders, or teaching agents a new workflow. | Use **Create rule** when adding `.cursor/rules/*.mdc` or coding standards. Use **Create skill** when authoring a new Agent Skill (e.g. “implement Midnight Satin screen from reference”) so subagents get consistent guidance. Keep descriptions specific and include trigger terms. |

### Where to find or install skills

- **Cursor rules:** Project rules live in `.cursor/rules/`. The `midnight-satin-design.mdc` rule is always applied; ensure any new rule is consistent with it.
- **Cursor Agent Skills:** Install or create skills so they are available to the agent(s) working on this project:
  - **Personal skills:** `~/.cursor/skills/` (e.g. `next-app-router`, `tailwind-design-tokens`, `vercel-postgres`).
  - **Project skills:** `.cursor/skills/` in this repo (e.g. `midnight-satin-screens`, `midnight-satin-property-tests`).
- **Skill format:** Each skill should have a `SKILL.md` with YAML frontmatter (`name`, `description`) and clear instructions. Descriptions should state *what* the skill does and *when* to use it (trigger scenarios). See Cursor’s skill authoring docs or the “create-skill” skill for structure.
- **MCP servers:** Configured in `.kiro/settings/mcp.json` (e.g. Stitch). Use MCP tools for design fetch and content-agent operations as specified in the requirements.

### Subagent assignment suggestions

When delegating to subagents, assign by domain so the right skills apply:

- **UI / screens:** Ensure Tailwind + design-system and Next.js App Router skills (and the project rule) are in context; give the specific `reference/*.html` and requirement numbers.
- **Data / API / DB:** Ensure Vercel Postgres/Blob/KV and TypeScript/domain-types skills; point to the design doc schema and server actions.
- **Auth / payments:** Ensure Authentication and Stripe/payment skills; reference requirements 9 and 8 and the design doc flows.
- **Tests:** Ensure property-based testing (fast-check) and Vitest; reference the correctness properties and `tasks.md` property-test mapping.
- **MCP / content tools:** Ensure MCP skill and API key handling; reference requirement 12 and the MCP tool list in the design doc.
- **Rules and skills:** Use Create-rule and Create-skill when adding or changing project conventions or agent instructions.

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Blob](https://vercel.com/docs/storage/vercel-blob), [KV](https://vercel.com/docs/storage/vercel-kv)
- Deploy on [Vercel](https://vercel.com/new) using the Next.js deployment guide.
