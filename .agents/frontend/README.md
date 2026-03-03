# Frontend subagent

**Scope:** All UI: design system setup, shared components, and every screen. Implements layout, fonts, tokens, navigation, Boudoir, Library, Novel Detail, Reading Room, Veil, Cast Gallery, Author’s Study, Vault, Profile, and CommentsSection.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Next.js App Router & RSC | Routes, layouts, Server Components, Server Actions, ISR/SSR for pages |
| Tailwind CSS & design tokens | Tactile Noir Luxury: colors, typography, safe-area, mobile-first max-w-md |
| Accessibility (a11y) | Focus order, aria-labels, semantics, focus trap in modals, WCAG 2.1 AA |

## Task scope (from `tasks.md`)

- 1.1 — Layout, Google Fonts, globals.css tokens, tailwind.config, max-w-md
- 4 — Shared UI: navigation-bar, shimmer, empty-state, credit-balance, novel-card, character-portrait, search-overlay, not-found, error
- 6, 6a — Boudoir, Library
- 7.1 — Novel Detail page (ParallaxHero, MetadataPills, SynopsisSection, PlayersSection, ChapterList, FAB, header)
- 8.1 — Reading Room page (ChapterContent, DropCap, ReadingHUD, ProgressBar)
- 10.1 — Cast Gallery modal
- 11.1 — Author’s Study page
- 12.1 — Vault page UI
- 14.1 — Profile & Library page
- 14.3 — CommentsSection in Reading Room

## Reference

- Design rule: `.cursor/rules/midnight-satin-design.mdc` (always apply when touching UI)
- Mockups: `reference/*.html`; PRD: `reference/midnight_satin_prd.html`
- Requirements: `.kiro/specs/midnight-satin-platform/requirements.md`
