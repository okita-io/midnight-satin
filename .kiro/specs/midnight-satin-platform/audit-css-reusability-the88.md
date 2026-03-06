# THE-88: 16.1 Audit CSS class reusability

**Requirements:** 14.1, 14.2, 14.3, 14.7

## Summary

Audit completed. Color tokens, Tailwind utilities, and typography are reused; violations were fixed where components used hardcoded hex/rgba instead of design tokens or Tailwind classes.

## Findings and fixes

### Color tokens (14.1, 14.2)

- **ornamental-divider.tsx**: Replaced `fill="#D4AF37"` and `stroke="#D4AF37"` with `currentColor` so the SVG inherits from parent `text-primary` (design token).
- **navigation-bar.tsx**: Replaced `shadow-[0_0_5px_#D4AF37]` with `style={{ boxShadow: "0 0 5px var(--color-primary)" }}`. Replaced `bg-[#080808]` and `border-[#1F1F1F]` with `bg-void` and `border-white/10` (design tokens).
- **reading-hud.tsx**: Replaced `bg-[#0a0a0a]` with `bg-void`.
- **auth-prompt.tsx**: Replaced `border-[rgba(212,175,55,0.2)]` and `bg-[var(--surface)]` with `border-primary/20` and `bg-surface`; `shadow-[var(--shadow-gold-glow)]` with `shadow-gold-glow`.

### Tailwind / typography (14.3)

- Typography classes (`font-display`, `font-header`, `font-body`, `font-ui`, `font-script`) are used consistently across 70+ component files; no new ad-hoc font stacks found.
- Shadow and color utilities (`shadow-gold-glow`, `text-primary`, `bg-primary`, `bg-void`, `bg-surface`, `border-primary/20`, etc.) are reused; remaining inline rgba (e.g. gold glow, card depth) match globals.css or tailwind.config and are acceptable.

### Component props (14.7)

- Shared components (e.g. NovelCard, CreditBalance, NavigationBar) accept `className` or layout props and are extended via props rather than duplicated.

### Intentional non-token usage (documented)

- **the-veil.tsx**: `bg-[#1a170e]` is a deliberate dark gold-tinted background for the paywall card; no design token exists for this variant.
- **vault-client.tsx**: `border-t-[#500014]` on PopularRibbon is a dark burgundy variant; accent token is #800020.
- **followed-authors-strip.tsx**, **hexagon-avatar.tsx**: Gradient end `to-[#8A7018]` is a dark gold; no token for gradient end.
- **trophy-case.tsx**: `border-[#393528]/30` is a muted gold border variant.

These can be centralized later if the design system adds semantic tokens for them.
