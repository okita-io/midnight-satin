# Midnight Satin — Pencil design files

Editable design source for screen layouts and the shared component library. Implementation still ships from `reference/*.html` until a unification pass; when Pencil and HTML disagree after a pass, **Pencil wins** until HTML is updated.

## Artboard sizes

| Tier | Width | Height (typical) | Notes |
|------|-------|------------------|--------|
| Mobile | **390** | ~1320–1600 | Matches existing Boudoir mobile shell |
| Tablet (iPad portrait) | **834** | ~1112–1400 | Content max-widths follow `src/lib/responsive/constants.ts` (e.g. reading column **672**) |

Place mobile at `x: 0`, tablet at `x: 390 + 80` (gap **80**).

Desktop (1024+) artboards are out of scope for this pass.

## Files

| File | Screens | App routes |
|------|---------|------------|
| `design_system.pen` | Tokens + reusable primitives | — |
| `midnight_satin_home.pen` | Boudoir mobile + tablet | `/` |
| `the_novel_detail.pen` | Novel detail mobile + tablet | `/novel/[id]` |
| `the_reading_room.pen` | Reading room mobile + tablet | `/novel/[id]/read/[chapterId]` |
| `the_library.pen` | Library grid mobile + tablet | `/library` |
| `the_vault_store.pen` | Vault mobile + tablet | `/vault` |
| `the_authors_study.pen` | Author study mobile + tablet | `/author/[id]` |
| `the_cast_gallery.pen` | Cast gallery mobile + tablet | cast modal / gallery |
| `the_auth.pen` | Clerk sign-in / sign-up shells | `/sign-in`, `/sign-up` |

## Regenerate

From repo root (or this directory):

```bash
node reference/pencil/build-design-system-pencil.mjs
node reference/pencil/build-midnight-satin-home-pencil.mjs
node reference/pencil/build-the-novel-detail-pencil.mjs
node reference/pencil/build-the-reading-room-pencil.mjs
node reference/pencil/build-the-library-pencil.mjs
node reference/pencil/build-the-vault-store-pencil.mjs
node reference/pencil/build-the-authors-study-pencil.mjs
node reference/pencil/build-the-cast-gallery-pencil.mjs
node reference/pencil/build-the-auth-pencil.mjs
```

Shared tokens/helpers: `pencil-tokens.mjs` (Pencil JSON **v2.14**, `type: "icon"`).

**Cross-file note:** Pencil cannot `ref` components across `.pen` files. Screen generators compose from **DS-aligned factories** in `pencil-tokens.mjs` (`sectionHeaderRow`, `progressBar`, `surfaceCard`, `bottomNav`, `readingHudFooter`, `backControl`, `castTopPickBadge`, `castEndorseButton`, etc.) that mirror `design_system.pen` reusables.

**Design system regen note:** `build-design-system-pencil.mjs` must stay in sync with live `design_system.pen` (cast portrait Endorse + Top Pick layout, dossier Rank pill, `$shadow.*` variables). Prefer editing reusables in Pencil, then porting durable changes back into the build script / `strip-reusables-after-dossier.json` before a full regen.

## HTML ↔ Pencil

Prefer pairing mobile + tablet HTML when both exist, e.g. `midnight_satin_home.html` + `midnight_satin_home_tablet.html`.

Compose screens from `design_system.pen` reusables (`MS · …`) and `$color.*` / `$font.*` variables when possible. Cross-file `ref` is not supported — screen generators use `pencil-tokens.mjs` factories that mirror those reusables.

**Phase 0 status:** Pencil artboards + DS backlog complete; HTML unification started (cast endorse chrome, Literata body stack, source-of-truth docs). Auth HTML remains a legacy mock — use `the_auth.pen` / Clerk routes for implementation.
