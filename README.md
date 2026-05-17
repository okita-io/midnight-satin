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

Open [http://localhost:3000](http://localhost:3000). Design reference files live in `reference/`; always implement screens to match the corresponding HTML mockups and the design system in `reference/midnight_satin_prd.html`. To preview reference mockups in the browser, run `npm run preview:reference` and open [http://localhost:3333](http://localhost:3333) (e.g. `/tablet_the_boudoir.html`).

### Romance Factory story import

From the repo root, import a **completed Romance Factory** story directory (author profile, book cover, chapters, character dossiers) into Postgres, generate cover/author/character art via [Replicate](https://replicate.com/) (recraft-v4) into `public/images/generated/`, and write a manifest at `<story>/midnightsatin_import.json`. Run against Neon using `POSTGRES_URL` from `.env.local` (or `.env`).

**Environment**

- `POSTGRES_URL` — required unless `--dry-run`
- `REPLICATE_API_TOKEN` — required unless `--dry-run` or `--skip-images`
- Optional: `ENV_FILE` or `DOTENV_CONFIG_PATH` to load a specific env file (see script)

**Examples**

```bash
node scripts/import-romance-factory-story.mjs --story-path /path/to/story
node scripts/import-romance-factory-story.mjs --story-path ./stories/my-story --featured --featured-order 1
node scripts/import-romance-factory-story.mjs --story-path ./stories/my-story --skip-images --no-git
```

**Flags**

| Flag | Meaning |
|------|--------|
| `--story-path <dir>` | Path to the completed story bundle (required) |
| `--dry-run` | No DB or image API calls; prints planned `/images/generated/...` paths |
| `--skip-images` | Do not call Replicate; uses placeholders where needed |
| `--no-git` | Do not `git add` / `commit` new files under `public/images/generated/` |
| `--featured` | Set the novel as featured in the database |
| `--featured-order <n>` | Optional ordering when featured |
| `--allow-defaults` | Relax validation (synth cover prompt / bio if missing, etc.) |
| `--max-characters <n>` | Cap character imports (default: 12) |
| `--reuse-author-id` / `--author-id` | Attach the novel to an existing author id |

### Seeding production content

Use these commands to populate the **production** Neon database so first-time visitors see stories, news, and developer posts on The Boudoir and `/updates`. All scripts read `POSTGRES_URL` from `.env.local` by default; point that variable at the **production** connection string from **Vercel → Storage → Neon** (or pass a dedicated env file).

**Environment**

- `POSTGRES_URL` — required (Neon connection string)
- `ENV_FILE` or `DOTENV_CONFIG_PATH` — optional path to an env file (e.g. production-only credentials)
- `BLOB_READ_WRITE_TOKEN` — required only for `npm run db:blobs` (upload seed images to Vercel Blob)

**Target production explicitly**

```bash
# Example: production credentials in a separate file (not committed)
ENV_FILE=.env.production.local npm run db:seed:devblog
```

Confirm the masked host in script output matches your production Neon instance before relying on the result.

**Placeholder story (featured novel + chapters)**

Inserts one author, series, featured novel (*Whispers in the Velvet Dark*), three chapters, and two characters. Images reference `/seed/images/...` under `public/`.

```bash
npm run db:seed
# Optional: upload seed PNGs to Blob and rewrite URLs in the DB
npm run db:blobs
```

**News articles (THE LATEST / `/updates`)**

Five placeholder articles covering all article types (see `src/lib/db/seed-news.sql`).

```bash
npm run db:seed:news
```

**Developer blog posts**

Long-form editorial posts (markdown body, rendered on the article detail page). The Romance Factory post-mortem lives in `src/lib/db/seed-devblog.sql` and uses `ON CONFLICT (slug) DO UPDATE` so re-runs are safe.

```bash
npm run db:seed:devblog
```

**Arbitrary SQL seed file**

```bash
node scripts/seed-sql.mjs --file src/lib/db/seed-devblog.sql
node scripts/seed-sql.mjs --file src/lib/db/seed-news.sql
```

**Full Romance Factory novels**

For completed story bundles (not the small built-in placeholder), use [Romance Factory story import](#romance-factory-story-import) (`npm run import:romance-story`).

**Suggested first-time production checklist**

1. Ensure `news_articles` (and other tables) exist — apply `src/lib/db/schema.sql` or migrations on production if this is a fresh DB.
2. `ENV_FILE=... npm run db:seed` — placeholder featured novel.
3. `ENV_FILE=... npm run db:blobs` — optional, if you want Blob URLs instead of `/seed/images/...`.
4. `ENV_FILE=... npm run db:seed:news` — THE LATEST section content.
5. `ENV_FILE=... npm run db:seed:devblog` — developer editorial posts.
6. Import real novels via Romance Factory import as they are ready.

**Verify**

- Home: featured novel and **THE LATEST** (ISR revalidates ~60s).
- `/updates` — news archive.
- `/updates/building-romance-factory-503-commits` — devblog article (after devblog seed).

**Safety**

- **Do not** run `npm run db:setup` against production — it drops all public tables and reapplies the schema.
- `db:seed` and `db:seed:news` use plain `INSERT`s; a second run may fail on duplicate titles/slugs unless the SQL uses `ON CONFLICT` (devblog seed already does).
- Romance Factory import creates **new** rows each run unless you reuse author IDs via `--reuse-author-id`.

### Payment (Stripe)

For credit purchases, set:

- `STRIPE_SECRET_KEY` — Stripe secret key (required for checkout and webhooks)
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret from Stripe Dashboard
- `STRIPE_PRICE_POUCH`, `STRIPE_PRICE_HANDFUL`, `STRIPE_PRICE_CHEST`, `STRIPE_PRICE_ROYAL` — Optional; if unset, Checkout uses ad-hoc prices from pack config

Configure the webhook endpoint `https://your-domain/api/webhooks/payment` in Stripe to receive `checkout.session.completed` events.

## Project layout (reference)

- **`reference/`** — HTML design mockups and PRD (source of truth for UI)
- **`.cursor/rules/`** — Cursor rules (e.g. `midnight-satin-design.mdc`, always applied)
- **`.kiro/specs/midnight-satin-platform/`** — Requirements, design doc, tasks, correctness properties
- **`src/app/`** — Next.js App Router pages and layout
- **`scripts/`** — Utilities: `seed-db.mjs`, `seed-sql.mjs` (production content; see [Seeding production content](#seeding-production-content)), `import-romance-factory-story.mjs` ([Romance Factory story import](#romance-factory-story-import)), `fetchStitchDesigns` for Stitch designs
- **`src/lib/db/`** — `schema.sql`, seed SQL (`seed-news.sql`, `seed-devblog.sql`)
- **`.agents/`** — Subagent directories; place agent-specific skills and scope here (see [Subagents and parallel task division](#subagents-and-parallel-task-division))

---

## Agentic development

This project is built with **AI agents and subagents** in mind. Specs, design files, and Cursor rules are structured so that agents can work on features, tests, and fixes with minimal ambiguity. The sections below define **required agent skills**, where to find them, and how to use them so each agent can perform optimally.

### How agents should use this repo

1. **Always respect the design system.** The rule in `.cursor/rules/midnight-satin-design.mdc` is always applied: implement screens using the reference HTML files in `reference/` and the palette/typography from the PRD (void black, gold, Literata/Playfair/Cinzel/Marcellus, mobile-first).
2. **Implement against the requirements.** Formal requirements and acceptance criteria are in `.kiro/specs/midnight-satin-platform/requirements.md`. The design doc (`.kiro/specs/midnight-satin-platform/design.md`) defines routes, components, server actions, data models, and correctness properties.
3. **Follow the task list.** Implementation tasks and property-test mapping are in `.kiro/specs/midnight-satin-platform/tasks.md`. When adding features, align with existing task numbering and property tags.
4. **Update and inspect the task list after each assignment.** Use the **tasks-md-update** skill (`.cursor/skills/tasks-md-update/`): mark tasks in progress with `[-]` only when work has started; mark complete with `[x]` only after verification; for test tasks, mark `[x]` only when all related tests pass (otherwise keep `[-]` and fix before re-testing).
5. **Run and extend tests.** Use Vitest for unit/component tests and fast-check for property-based tests. New behavior that touches credits, auth, or content should be covered by the relevant correctness properties in the design doc.
6. **Check terminal and paths.** Run commands from the repo root unless a task specifies a subproject. Wait for command output before proceeding; the environment may be slow.

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
| **Task list (tasks.md) update** | Update and verify `.kiro/specs/midnight-satin-platform/tasks.md` with correct states: `[ ]` not started, `[-]` in progress, `[x]` complete after verification; test tasks only `[x]` when all tests pass. | After each assignment, when coordinating work, or when updating task status. | Apply the **tasks-md-update** skill (`.cursor/skills/tasks-md-update/SKILL.md`). Inspect the task list after each assignment; for test tasks, run tests and only mark complete when all pass—otherwise set back to `[-]` and verify fixes. |

### Where to find or install skills

- **Cursor rules:** Project rules live in `.cursor/rules/`. The `midnight-satin-design.mdc` rule is always applied; ensure any new rule is consistent with it.
- **Cursor Agent Skills:** Install or create skills so they are available to the agent(s) working on this project:
  - **Personal skills:** `~/.cursor/skills/` (e.g. `next-app-router`, `tailwind-design-tokens`, `vercel-postgres`).
  - **Project skills:** `.cursor/skills/` in this repo (e.g. `midnight-satin-screens`, `midnight-satin-property-tests`).
- **Skill format:** Each skill should have a `SKILL.md` with YAML frontmatter (`name`, `description`) and clear instructions. Descriptions should state *what* the skill does and *when* to use it (trigger scenarios). See Cursor’s skill authoring docs or the “create-skill” skill for structure.
- **MCP servers:** Configured in `.kiro/settings/mcp.json` (e.g. Stitch). Use MCP tools for design fetch and content-agent operations as specified in the requirements.

### Subagents and parallel task division

Subagents are defined so work can be split and run **in parallel** where dependencies allow. Each subagent has a directory under **`.agents/`** where you can place agent-specific skills (or symlinks/references to `.cursor/skills/`). The table below lists each subagent, its skills, task scope, and which others it can run alongside.

| Subagent | Directory | Skills to load | Task scope (from `tasks.md`) | Runs in parallel with |
|----------|-----------|----------------|------------------------------|------------------------|
| **frontend** | `.agents/frontend/` | Next.js App Router & RSC, Tailwind CSS & design tokens, Accessibility (a11y) | 1.1 (layout, fonts, design system), 4 (shared UI), 6, 6a, 7.1, 8.1, 10.1, 11.1, 12.1, 14.1, 14.3 (all screens and shared components) | backend-data, backend-auth, backend-payments, backend-features, mcp-admin, testing |
| **backend-data** | `.agents/backend-data/` | Vercel Postgres / Blob / KV, TypeScript & domain types | 1.2 (schema, types), 5.1 (content fetching, cache, blob) | frontend, backend-auth, testing |
| **backend-auth** | `.agents/backend-auth/` | Authentication & session, Next.js App Router (middleware, Server Actions) | 2.1 (auth actions, middleware), 2.2 (login/register UI) | frontend, backend-data, backend-payments, backend-features, testing (after backend-data has readers table) |
| **backend-payments** | `.agents/backend-payments/` | Stripe / payment webhooks, Vercel Postgres, TypeScript | 12.2 (purchaseCredits, payment webhook, idempotency) | frontend, backend-features, mcp-admin, testing (after backend-data + backend-auth) |
| **backend-features** | `.agents/backend-features/` | Vercel Postgres, TypeScript & domain types | 7.2 (bookmarks), 8.2–8.3 (reading progress, Veil unlock), 10.2 (endorsements), 11.2 (follow), 14.2 (comments data layer) | frontend, backend-payments, mcp-admin, testing (after backend-data + backend-auth) |
| **mcp-admin** | `.agents/mcp-admin/` | MCP (Model Context Protocol), Next.js API routes, Vercel Postgres | 13.1 (MCP endpoint + tools), 13.2 (admin dashboard CRUD) | frontend, backend-features, backend-payments, testing (after backend-data + backend-auth) |
| **testing** | `.agents/testing/` | Property-based testing (fast-check), Vitest, React Testing Library | All property tests (1.3, 2.3, 2.4, 4.2, 6.2, 7.3, 8.4, 8.5, 10.3, 11.3, 12.3, 13.3, 14.4); unit/component tests; test generators | Any (run alongside feature work; add tests as features land) |

#### Parallel execution order (dependency-aware)

1. **Start together (no code deps):**  
   **backend-data** (schema + types + content layer), **frontend** (design system 1.1 + shared components 4), **testing** (generators + Property 1).
2. **After schema exists:**  
   **backend-auth** (auth + login/register UI).
3. **After auth exists:**  
   **backend-payments**, **backend-features**, **mcp-admin** can all run in parallel.  
   **frontend** continues with all screens (Boudoir, Library, Novel Detail, Reading Room, Veil, Cast Gallery, Author’s Study, Vault, Profile, CommentsSection).
4. **Ongoing:**  
   **testing** adds property and unit tests for each feature; run after each chunk of work.

#### Where to put skills for each subagent

- **Project-level skills** for a subagent: put skill files (e.g. `SKILL.md` plus any `reference.md`) in **`.agents/<subagent-name>/`** (e.g. `.agents/frontend/`, `.agents/backend-data/`). Optionally use **`.cursor/skills/<skill-name>/`** and reference that from the subagent’s README in `.agents/`.
- **Personal skills** (e.g. `~/.cursor/skills/next-app-router/`): list them in the subagent’s `.agents/<name>/README.md` so operators know which to enable when invoking that subagent.
- Every subagent should respect the project rule **`.cursor/rules/midnight-satin-design.mdc`** when touching UI; backend-only subagents still need design doc and requirements for types and contracts.

---

### Subagent assignment suggestions (quick reference)

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

### Vercel production

```bash
if [ "$VERCEL_ENV" == "production" ] || [ "$VERCEL_ENV" == "beta" ]; then exit 1; else exit 0; fi
if [ "$VERCEL_GIT_COMMIT_REF" == "production" ] || [ "$VERCEL_GIT_COMMIT_REF" == "beta" ]; then exit 1; else exit 0; fi
```
