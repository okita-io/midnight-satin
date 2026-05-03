# Midnight Satin Component Unification Plan

## Overview
This document outlines inconsistencies found in the Midnight Satin Next.js app and proposes a unification strategy to create a more cohesive, stable, and maintainable UI component system.

## Issues Identified

### 1. Inconsistent Component Variant Patterns
- **File**: `src/app/_components/novel-card.tsx`
- **Issue**: Uses multiple boolean props combined with string variant (`variant?: "default" | "compact" | "list-expanded" | "list"`)
- **Impact**: Complex conditional logic, difficult to extend, potential for prop conflicts

### 2. Inconsistent Icon Usage
- **Files**: Multiple components (`navigation-bar.tsx`, `boudoir-header.tsx`, etc.)
- **Issue**: Icons styled inconsistently:
  - Inline style objects: `style={{ fontSize: isActive ? 28 : 24, color: ... }}`
  - Class variants: `text-primary text-xl`
  - Direct material symbols usage without abstraction
- **Impact**: Difficulty maintaining consistent icon sizing, colors, and hover effects

### 3. Mixed Responsive Design Approaches
- **Files**: Throughout components
- **Issue**: 
  - Custom hooks: `usePointerDevice()`, `shouldApplyHoverForDevice()`
  - Tailwind breakpoints: `xs:`, `md:`, `lg:`
  - Media queries in style objects
- **Impact**: Inconsistent responsive behavior, duplicated logic

### 4. Inconsistent State Management for UI Elements
- **Files**: Various components
- **Issue**:
  - Local state (`useState`) for UI toggles (search open, view mode)
  - Prop-driven state for similar concepts (active tab)
- **Impact**: Unclear state ownership, potential sync issues

### 5. Non-standardized Interaction Patterns
- **Files**: Various components
- **Issue**:
  - Different hover implementations (`group-hover`, custom hover handlers, inline styles)
  - Varying focus/active state styles
  - Inconsistent press/tap feedback
- **Impact**: Inconsistent user experience across the app

### 6. Loading & Error State Inconsistency
- **Files**: `library-catalog.tsx` (uses `ShimmerPlaceholder`), others lack loading states
- **Issue**: No standardized approach to loading, error, or empty states
- **Impact**: Poor user experience during data fetching, inconsistent feedback

### 7. Component Composition Patterns
- **Files**: Various
- **Issue**: 
  - Some components accept `className` prop, others don't
  - Inconsistent handling of optional children/content
  - Varying approaches to component extension/customization
- **Impact**: Difficulty composing components, code duplication

## Recommended Unification Strategy

### 1. Create a Centralized UI Component Library
**Location**: `src/components/ui/`

**Components to create**:
- `Button` (primary, secondary, icon-only, loading states)
- `Icon` (wrapper for material symbols with consistent sizing/variants)
- `Input` (text, search, with labels, validation states)
- `Card` (base card with variants: elevated, outlined, hoverable)
- `Badge` (status indicators, tags, chips)
- `Avatar` (user/author avatars with fallbacks)
- `Loader` (spinners, skeleton placeholders)
- `Tooltip` (consistent tooltip behavior)
- `Tooltip` (consistent tooltip behavior)
- `Modal` / `Dialog` (overlay containers)
- `Tooltip` (consistent tooltip behavior)

### 2. Standardize Component APIs
**Props conventions**:
- All interactive components accept `className?: string` for extension
- Variant props use discriminated unions: `variant: "default" | "outline" | "ghost" | "link"`
- Size props: `size: "sm" | "md" | "lg" | "xl"`
- Consistent naming for callbacks: `onChange`, `onClick`, `onSubmit`
- All components forward refs to root element when appropriate

### 3. Establish Design Token Usage
**Use existing Tailwind config but create utility functions**:
```typescript
// lib/theme/useColors.ts
export function useColors() {
  return {
    primary: 'var(--primary)',
    primaryDark: 'var(--primary-dark)',
    textMain: 'var(--text-main)',
    textMuted: 'var(--text-muted)',
    // ... etc
  };
}

// lib/theme/useSpacing.ts
export function useSpacing() {
  return {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  };
}
```

### 4. Create Standardized Hooks
**Location**: `lib/ui/`

**Hooks to create**:
- `useHover` - consistent hover state management
- `useFocusVisible` - proper focus ring handling
- `useClickOutside` - for dropdowns, menus
- `useResponsive` - unified breakpoint detection
- `useDeviceType` - touch vs pointer detection (with SSR safety)

### 5. Implement Consistent State Patterns
**Guidelines**:
- UI-only state (toggles, hover, focus): local `useState` or custom hooks
- Shared state (user data, navigation): lift to appropriate context or state management
- Form state: consider React Hook Form or zod integration
- Server state: continue using React Query/SWR patterns as appropriate

### 6. Standardize Loading & Error States
**Create components**:
- `SkeletonLoader` - for placeholder content
- `LoadingIndicator` - spinner variants
- `ErrorBoundary` - component-level error handling
- `EmptyState` - consistent empty state illustration + message

### 7. Documentation & Enforcement
**Create**:
- `src/components/ui/README.md` - usage guidelines, examples
- Component stories (if using Storybook) or example pages
- ESLint rules for prop consistency (optional)
- Code review checklist for UI components

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create `src/components/ui/` directory
- [ ] Implement `Icon` component with consistent API
- [ ] Create `Button` component (primary/secondary variants)
- [ ] Establish theme utility functions
- [ ] Create `useHover` and `useFocusVisible` hooks

### Phase 2: Core Components (Week 2)
- [ ] Implement `Input`, `Textarea` components
- [ ] Create `Card` component with variants
- [ ] Implement `Badge` and `Avatar` components
- [ ] Create `Loader` and `SkeletonLoader` components

### Phase 3: Container & Feedback (Week 3)
- [ ] Implement `Modal`/`Dialog` system
- [ ] Create `Tooltip` component
- [ ] Implement `LoadingIndicator` and `ErrorBoundary`
- [ ] Standardize `EmptyState` usage

### Phase 4: Migration (Week 4)
- [ ] Replace icon usage in `navigation-bar.tsx`, `boudoir-header.tsx`
- [ ] Refactor `novel-card.tsx` to use new UI components
- [ ] Update `library-catalog.tsx` to use standardized components
- [ ] Migrate form components to use new `Input`, `Button`
- [ ] Replace custom hover logic with `useHover` hook

### Phase 5: Review & Refinement (Week 5)
- [ ] Audit all components for API consistency
- [ ] Test responsive behavior across breakpoints
- [ ] Verify accessibility (color contrast, focus order, ARIA labels)
- [ ] Document usage examples in README
- [ ] Gather feedback from team/stakeholders

## Success Metrics
- Reduction in custom CSS/inline styles in components
- Increased component reusability (measured by reuse count)
- Consistent visual language across all screens
- Improved developer onboarding time for new UI work
- Reduced CSS bundle size through utility-first approach
- Fewer UI-related bugs reported

## Files to Reference
- Design reference: `reference/` directory
- Existing Tailwind config: `tailwind.config.ts`
- Current component locations: `src/app/_components/`
- Component patterns to unify: `novel-card.tsx`, `library-catalog.tsx`, `navigation-bar.tsx`, `boudoir-header.tsx`

---

*This plan should be reviewed and adapted based on team feedback and evolving requirements.*