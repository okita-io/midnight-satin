# Midnight Satin UI catalog

Shared primitives hand-ported from Pencil `MS ·` reusables in `reference/pencil/design_system.pen` (factories in `reference/pencil/pencil-tokens.mjs`). Product screens stay under `src/app/_components/`; import catalog pieces from here when a primitive exists.

```ts
import {
  Icon,
  BackLink,
  BackButton,
  DetailSectionHeading,
  Text,
  Button,
  ButtonLink,
  TextInput,
  FormField,
  SearchField,
  Card,
  Skeleton,
} from "@/components/ui";
```

## Quick index

| I need… | Use |
|---------|-----|
| Material Symbol glyph | `Icon` |
| Back / up with `href` | `BackLink` |
| Back via history (or fallback) | `BackButton` |
| Novel detail section title (+ optional View all) | `DetailSectionHeading` |
| Font role without inventing classes | `Text` (`display` / `section` / `body` / `ui` / `script`) |
| Gold CTA / outline / icon ghost button | `Button` (`primary` / `secondary` / `iconGhost`) |
| Same as button, but a link | `ButtonLink` (`primary` / `secondary`) |
| Labeled form control | `FormField` |
| Bare form input | `TextInput` |
| Search overlay input | `SearchField` |
| Surface card (+ optional sheen) | `Card` |
| Loading shimmer block | `Skeleton` |
| View all link/button | `SectionViewAllLink` / `SectionViewAllButton` in `src/app/_components/section-view-all.tsx` |
| Bottom nav bar chrome / progress | `FixedBottomBar` / `ProgressBar` in `src/app/_components/chrome-primitives.tsx` |

Legacy paths (`button-primitives`, `form-field`, `ShimmerPlaceholder`) re-export catalog APIs for back-compat.

## Pencil → React map

| Pencil / factory | React |
|------------------|--------|
| `MS · Icon · Material scale` | `Icon` |
| `MS · Back · Icon + label` / `backControl` | `BackLink`, `BackButton` |
| `MS · Type · Section title` / `MS · Section label` / `sectionHeaderRow` | `DetailSectionHeading` (+ View all from `_components`) |
| `MS · Type · Display hero` | `Text variant="display"` |
| `MS · Type · Section title (Cinzel)` | `Text variant="section"` |
| `MS · Type · Body default` | `Text variant="body"` |
| `MS · Type · UI label` | `Text variant="ui"` |
| `MS · Type · Script accent` | `Text variant="script"` |
| `MS · Gold pill button` / `goldPill` | `Button` / `ButtonLink` `variant="primary"` (`.btn-gold`) |
| `MS · Button · Secondary outline` | `Button` / `ButtonLink` `variant="secondary"` |
| `MS · Button · Icon ghost` | `Button variant="iconGhost"` |
| `MS · Form · Text field + label` | `FormField`, `TextInput` |
| Search overlay input chrome | `SearchField` |
| `MS · Card chrome` / `surfaceCard` | `Card` |
| Loading shimmer shell | `Skeleton` (alias: `ShimmerPlaceholder`) |

## Typography matrix

Align adjacent UI to **one** role per semantic job (see `unification_plan.md`):

| Semantic role | Tailwind | Typical use |
|---------------|----------|-------------|
| Display / novel titles | `font-display` | Card titles, hero titles |
| Section / screen labels | `font-header` | Section bands, nav labels |
| Body / prose | `font-body` | Synopsis, reviews, chapter text |
| UI / controls / metadata | `font-ui` | Buttons, counts, pills |
| Accent / emotional line | `font-script` | Empty-state headlines — sparse |

`Text` variants set the font role only; size, color, and tracking stay on `className` so migrations stay pixel-parity.

## Conventions

- Prefer catalog imports for **new** UI; migrate existing call sites when you touch a file.
- Keep visual parity with Pencil/HTML; do not redesign while extracting.
- Phase 3+: Dialog / EmptyState baseline — see `unification_plan.md`.
