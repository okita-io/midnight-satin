# Design Document: Responsive Tablet and Desktop Views

## Overview

This design extends the Midnight Satin romance reading application from its current mobile-first implementation to provide optimized experiences for tablet (768px-1023px) and desktop (1024px+) viewports. The design maintains the established Tactile Noir Luxury aesthetic—void black backgrounds (#050505), metallic gold accents (#D4AF37), Playfair Display typography, and silk texture overlays—while adapting layouts to leverage larger screen real estate.

### Design Philosophy

The responsive system follows these core principles:

1. **Progressive Enhancement**: Mobile-first foundation with additive enhancements for larger screens
2. **Asset Reusability**: Extend existing components with responsive props rather than creating duplicates
3. **Aesthetic Consistency**: Preserve premium visual language across all breakpoints
4. **Performance First**: Lazy loading, optimized images, and smooth transitions
5. **Touch + Mouse Parity**: Support both touch interactions and hover states

### Key Design Decisions

**Breakpoint Strategy**: We use Tailwind's existing `md:` (768px) and `lg:` (1024px) breakpoints to align with industry standards and leverage the framework's built-in utilities.

**Navigation Transformation**: The bottom navigation bar transitions to a persistent side panel on tablet/desktop, freeing vertical space while maintaining quick access to all sections.

**Content Density**: Layouts progressively show more content per row (2 columns on tablet, 3-4 on desktop) without compromising the spacious, luxurious feel.

**Reading Optimization**: Text width is constrained to 680-720px on larger screens to maintain optimal reading comfort (45-75 characters per line).

## Architecture

### Responsive System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Viewport Detection Layer                  │
│              (CSS Media Queries via Tailwind)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component Prop Layer                       │
│         (Responsive props: columns, layout, size)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layout Components                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Navigation   │  │ Grid Systems │  │ Typography   │      │
│  │ (Bottom→Side)│  │ (1→2→3 cols) │  │ (Responsive) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Interaction Layer                         │
│         (Touch events + Hover states + Animations)           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS with custom design tokens
- **Responsive Strategy**: Mobile-first CSS with `md:` and `lg:` breakpoints
- **State Management**: React hooks for client-side responsive behavior
- **Animation**: CSS transitions and transforms (existing patterns)

### File Structure

```
src/app/_components/
├── navigation-bar.tsx          # Extended with side panel layout
├── hero-carousel.tsx           # Extended with multi-item display
├── novel-card.tsx              # Extended with responsive sizing
├── library-catalog.tsx         # Extended with grid columns
├── reading-room/
│   ├── chapter-content.tsx     # Extended with max-width constraints
│   └── comments-sidebar.tsx    # NEW: Desktop sidebar component
├── cast-gallery-modal.tsx      # Extended with grid columns
├── author/
│   └── author-profile.tsx      # Extended with two-column layout
└── profile/
    └── profile-page.tsx        # Extended with horizontal stats

src/app/globals.css             # Extended with responsive utilities
```

## Components and Interfaces

### 1. Navigation System

#### NavigationBar Component

**Current State**: Fixed bottom bar with 4 tabs (Boudoir, Library, Vault, Profile)

**Responsive Enhancement**:

```typescript
interface NavigationBarProps {
  activeTab: NavTab;
  layout?: 'bottom' | 'side'; // Auto-detected via CSS, but can be forced
}
```

**Layout Specifications**:

- **Mobile (< 768px)**: Bottom bar, 100% width, 4 horizontal tabs
- **Tablet/Desktop (≥ 768px)**: Left sidebar, 280px fixed width, vertical tabs

**Visual Design**:

```
Desktop Side Panel (280px × 100vh)
┌────────────────────────────┐
│  [Logo/Brand]              │ ← 64px height
├────────────────────────────┤
│  ◉ Boudoir                 │ ← 56px height each
│  ○ Library                 │   Gold glow on active
│  ○ Vault                   │   Icon + Label vertical
│  ○ Profile                 │
├────────────────────────────┤
│  [Credit Balance]          │ ← Bottom section
└────────────────────────────┘
```

**CSS Implementation**:

```css
/* Mobile: bottom bar (default) */
.navigation-bar {
  @apply fixed bottom-0 left-0 right-0 z-50;
  @apply flex flex-row justify-between;
}

/* Tablet/Desktop: side panel */
@media (min-width: 768px) {
  .navigation-bar {
    @apply fixed left-0 top-0 bottom-0;
    @apply w-[280px] flex-col justify-start;
    @apply border-r border-[#1F1F1F];
  }
}
```

**Animation**: Smooth transition when resizing across breakpoint (300ms ease-in-out)

### 2. Boudoir (Home) Layout

#### HeroCarousel Component

**Current State**: Single full-width featured book

**Responsive Enhancement**:

```typescript
interface HeroCarouselProps {
  featured: FeaturedNovel[];  // Array instead of single
  itemsPerView?: number;      // Auto: 1 mobile, 2 tablet, 3 desktop
}
```

**Layout Specifications**:

- **Mobile**: 1 book, 380-420px height
- **Tablet**: 2 books side-by-side, 480px height, 24px gap
- **Desktop**: 3 books side-by-side, 520px height, 32px gap

**Visual Design**:

```
Desktop Hero (3 books)
┌──────────────┬──────────────┬──────────────┐
│   Book 1     │   Book 2     │   Book 3     │
│  (Primary)   │  (Featured)  │  (Featured)  │
│              │              │              │
│  [CTA]       │  [CTA]       │  [CTA]       │
└──────────────┴──────────────┴──────────────┘
```

#### Grid Sections (High Society, Current Affairs, Players)

**Current State**: Horizontal scroll, 110-130px cards

**Responsive Enhancement**:

```typescript
interface GridSectionProps {
  novels: NovelCardData[];
  columns?: 'auto' | 2 | 3 | 4;  // Auto-responsive
  gap?: 'default' | 'comfortable' | 'spacious';
}
```

**Layout Specifications**:

- **Mobile**: Horizontal scroll (unchanged)
- **Tablet**: 2-column grid, 24px gap, no scroll
- **Desktop**: 3-column grid, 32px gap, max-width 1440px centered

**CSS Grid Implementation**:

```css
.novel-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 768px) {
  .novel-grid {
    @apply grid-cols-2 gap-6;
  }
}

@media (min-width: 1024px) {
  .novel-grid {
    @apply grid-cols-3 gap-8;
    @apply max-w-[1440px] mx-auto;
  }
}
```

### 3. Library Catalog

#### LibraryCatalog Component

**Current State**: Grid/list toggle, mobile-optimized

**Responsive Enhancement**:

```typescript
interface LibraryCatalogProps {
  novels: NovelCardData[];
  view: 'grid' | 'list';
  gridColumns?: { mobile: 1, tablet: 3, desktop: 4 };
}
```

**Grid View Specifications**:

- **Mobile**: 1 column (or 2 if space allows)
- **Tablet**: 3 columns, 24px gap
- **Desktop**: 4 columns, 32px gap

**List View Specifications**:

- **Mobile**: 1 column, compact cards
- **Tablet**: 2 columns, expanded metadata
- **Desktop**: 1 column, full metadata (author bio, tags, rating, chapter count)

**Desktop List View Layout**:

```
┌────────────────────────────────────────────────────────────┐
│ [Cover]  Title                                    ★ 4.8    │
│  160px   Author Name                              [Genre]  │
│  240px   Synopsis excerpt (2 lines)...            [Tags]   │
│          24 Chapters • 180k words • Updated 2d ago         │
└────────────────────────────────────────────────────────────┘
```

### 4. Novel Detail Page

#### NovelDetailHeader Component

**Current State**: Vertical stack (cover, title, metadata, synopsis)

**Responsive Enhancement**:

```typescript
interface NovelDetailHeaderProps {
  novel: NovelData;
  layout?: 'stacked' | 'two-column';  // Auto-responsive
}
```

**Two-Column Layout** (Tablet/Desktop):

```
┌─────────────────┬──────────────────────────────────────┐
│                 │  Title (Playfair Display 48px)       │
│   Cover Image   │  By Author Name                      │
│   (40% width)   │  ★★★★★ 4.8 (1.2k ratings)           │
│   Parallax      │                                      │
│   Effect        │  [Romance] [Historical] [Mature]    │
│                 │                                      │
│                 │  Synopsis (Literata 16px)            │
│                 │  Lorem ipsum dolor sit amet...       │
│                 │                                      │
│                 │  [Start Reading] [Add to Library]   │
└─────────────────┴──────────────────────────────────────┘
```

**Dimensions**:

- Cover column: 40% width, sticky positioning
- Metadata column: 60% width, scrollable
- Gap: 48px on tablet, 64px on desktop

#### Cast Preview Section

**Current State**: Horizontal scroll, 4-6 portraits visible

**Responsive Enhancement**:

- **Mobile**: Horizontal scroll, 4 visible
- **Tablet**: Horizontal scroll, 4 visible (larger portraits)
- **Desktop**: Grid or horizontal scroll, 6 visible

#### Chapter List

**Current State**: Single column list

**Responsive Enhancement**:

- **Mobile**: Single column (unchanged)
- **Tablet**: Single column (unchanged)
- **Desktop**: 2-column grid for faster scanning

### 5. Reading Room

#### ChapterContent Component

**Current State**: Full-width text with side padding

**Responsive Enhancement**:

```typescript
interface ChapterContentProps {
  content: string;
  maxWidth?: 'mobile' | 'tablet' | 'desktop';  // Auto-responsive
}
```

**Typography Specifications**:

- **Font Size**: 18px (all breakpoints)
- **Line Height**: 1.6 (all breakpoints)
- **Max Width**: 
  - Mobile: 100% - 32px padding
  - Tablet: 680px centered
  - Desktop: 720px centered
- **Side Margins**:
  - Mobile: 16px
  - Tablet: 48px
  - Desktop: 64px

**Layout**:

```
Desktop Reading Room
┌────────────────────────────────────────────────────────────┐
│                                                            │
│        ┌──────────────────────┐  ┌──────────────┐        │
│        │                      │  │   Comments   │        │
│        │   Chapter Text       │  │   Sidebar    │        │
│        │   (720px max)        │  │   (320px)    │        │
│        │                      │  │              │        │
│        │   Centered           │  │   Fixed      │        │
│        │                      │  │   Position   │        │
│        └──────────────────────┘  └──────────────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### CommentsSidebar Component (NEW)

**Desktop Only** (≥ 1024px):

```typescript
interface CommentsSidebarProps {
  chapterId: string;
  comments: Comment[];
  position?: 'right' | 'left';  // Default: right
}
```

**Specifications**:

- Width: 320px fixed
- Position: Fixed on right side
- Scroll: Independent from main content
- Styling: Same as mobile comments (dark background, gold accents)

**Mobile/Tablet**: Comments remain below chapter content (unchanged)

### 6. Cast Gallery

#### CastGalleryModal Component

**Current State**: Full-screen modal, single column portraits

**Responsive Enhancement**:

```typescript
interface CastGalleryModalProps {
  characters: Character[];
  gridColumns?: { mobile: 1, tablet: 2, desktop: 3 };
}
```

**Grid Specifications**:

- **Mobile**: 1 column, full-width cards
- **Tablet**: 2 columns, 24px gap
- **Desktop**: 3 columns, 32px gap, max-width 1200px

**Card Dimensions**:

- Portrait: Maintains aspect ratio
- Card height: Auto-adjusts to content
- Flip animation: Preserved across all breakpoints

### 7. Author's Study

#### AuthorProfile Component

**Current State**: Vertical stack (avatar, bio, works)

**Responsive Enhancement**:

```typescript
interface AuthorProfileProps {
  author: AuthorData;
  layout?: 'stacked' | 'two-column';  // Auto-responsive
}
```

**Two-Column Layout** (Tablet/Desktop):

```
┌──────────────────┬─────────────────────────────────────┐
│                  │  Bibliography                       │
│   Biography      │  ┌─────────┬─────────┬─────────┐  │
│   (35% width)    │  │ Novel 1 │ Novel 2 │ Novel 3 │  │
│                  │  └─────────┴─────────┴─────────┘  │
│   [Avatar]       │  ┌─────────┬─────────┬─────────┐  │
│   180px tablet   │  │ Novel 4 │ Novel 5 │ Novel 6 │  │
│   220px desktop  │  └─────────┴─────────┴─────────┘  │
│                  │                                     │
│   Bio text...    │  Trophy Case                       │
│                  │  ┌───┬───┬───┬───┐ (4 cols)       │
│   [Follow]       │  │ 🏆│ 🏆│ 🏆│ 🏆│                │
│                  │  └───┴───┴───┴───┘                │
└──────────────────┴─────────────────────────────────────┘
```

**Trophy Case Grid**:

- **Tablet**: 3 columns
- **Desktop**: 4 columns

### 8. Vault (Store)

#### VaultPage Component

**Current State**: Vertical stack of credit packages

**Responsive Enhancement**:

```typescript
interface VaultPageProps {
  packages: CreditPackage[];
  gridColumns?: { mobile: 1, tablet: 2, desktop: 3 };
}
```

**Grid Specifications**:

- **Mobile**: 1 column (unchanged)
- **Tablet**: 2 columns, 24px gap
- **Desktop**: 3 columns, 32px gap, max-width 1200px

**Credit Balance Display**:

- **Mobile**: 36px font size
- **Tablet**: 48px font size
- **Desktop**: 56px font size

**Package Card**: Maintains all styling (burgundy ribbon, gold borders, coin rain animation)

### 9. Profile Page

#### ProfilePage Component

**Current State**: Vertical sections (stats, followed authors, library)

**Responsive Enhancement**:

**Reading Stats**:

- **Mobile**: Vertical stack (3 stat cards)
- **Tablet/Desktop**: Horizontal row (3 stat cards, equal width)

**Followed Authors Strip**:

- **Mobile**: Horizontal scroll, 4 avatars visible
- **Tablet**: Horizontal scroll, 6 avatars visible
- **Desktop**: Horizontal scroll, 8 avatars visible

**Library Grid**:

- **Mobile**: 2 columns
- **Tablet**: 2 columns (larger cards)
- **Desktop**: 3 columns

### 10. Authentication Pages

#### LoginPage / RegisterPage Components

**Current State**: Full-width forms with side padding

**Responsive Enhancement**:

```typescript
interface AuthFormProps {
  maxWidth?: number;  // Default: 480px
  centered?: boolean; // Default: true on tablet/desktop
}
```

**Layout**:

- **Mobile**: Full width with 16px padding (unchanged)
- **Tablet/Desktop**: 480px max-width, horizontally centered

**Styling**: All input fields, buttons, and validation messages maintain existing styling

## Data Models

### Responsive Configuration

```typescript
// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

// Grid column configurations
export interface GridConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export const GRID_CONFIGS = {
  boudoir: { mobile: 1, tablet: 2, desktop: 3 },
  library: { mobile: 2, tablet: 3, desktop: 4 },
  cast: { mobile: 1, tablet: 2, desktop: 3 },
  vault: { mobile: 1, tablet: 2, desktop: 3 },
  profile: { mobile: 2, tablet: 2, desktop: 3 },
} as const;

// Spacing configurations
export interface SpacingConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export const GAP_CONFIGS = {
  default: { mobile: 16, tablet: 24, desktop: 32 },
  comfortable: { mobile: 20, tablet: 28, desktop: 36 },
  spacious: { mobile: 24, tablet: 32, desktop: 40 },
} as const;
```

### Component Props Extensions

```typescript
// Base responsive props mixin
export interface ResponsiveProps {
  /** Override automatic responsive behavior */
  forceLayout?: 'mobile' | 'tablet' | 'desktop';
  /** Custom grid columns per breakpoint */
  gridColumns?: Partial<GridConfig>;
  /** Custom gap spacing per breakpoint */
  gap?: keyof typeof GAP_CONFIGS | SpacingConfig;
}

// Extended component props
export interface NovelCardProps extends ResponsiveProps {
  novel: NovelCardData;
  variant?: 'default' | 'compact' | 'expanded';
  showHoverEffects?: boolean;  // Auto-detect pointer device
}

export interface NavigationBarProps extends ResponsiveProps {
  activeTab: NavTab;
  layout?: 'bottom' | 'side';  // Auto-responsive
  showLabels?: boolean;
}
```

### Viewport Detection Hook

```typescript
// Custom hook for responsive behavior
export function useViewport() {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.desktop) {
        setViewport('desktop');
      } else if (width >= BREAKPOINTS.tablet) {
        setViewport('tablet');
      } else {
        setViewport('mobile');
      }
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  return viewport;
}

// Pointer device detection
export function usePointerDevice() {
  const [hasHover, setHasHover] = useState(false);
  
  useEffect(() => {
    setHasHover(window.matchMedia('(hover: hover)').matches);
  }, []);
  
  return hasHover;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 105 acceptance criteria, I identified the following redundancies and consolidations:

**Redundancy Group 1: Grid Column Properties**
- Multiple criteria test grid columns for different components (Boudoir, Library, Cast, Vault, Profile) at the same breakpoints
- These can be consolidated into component-specific properties that test the general rule rather than separate properties per breakpoint

**Redundancy Group 2: Styling Consistency**
- Many criteria test that styling (gold accents, typography, borders) is preserved across breakpoints
- These can be consolidated into broader "styling consistency" properties per component rather than separate properties for each style element

**Redundancy Group 3: Specific Dimension Values**
- Criteria testing specific px values (280px nav width, 680px text width, etc.) are examples, not properties
- These should be tested as unit tests, not property-based tests

**Redundancy Group 4: Viewport Range Testing**
- Criteria 1.3, 1.4, 1.5 all test that the correct layout renders for viewport ranges
- These can be combined into a single property about viewport-to-layout mapping

**Consolidation Decisions**:
- Combine all "maintain styling" criteria into per-component styling consistency properties
- Combine all grid column criteria into per-component responsive grid properties
- Keep viewport detection as a single property rather than three separate ones
- Specific dimension tests remain as examples (unit tests), not properties

### Property 1: Viewport Layout Mapping

*For any* viewport width, the system should render the correct layout tier: mobile for widths < 768px, tablet for widths 768-1023px, and desktop for widths ≥ 1024px.

**Validates: Requirements 1.3, 1.4, 1.5**

### Property 2: Navigation Layout Transformation

*For any* viewport width ≥ 768px, the navigation bar should render as a side panel with vertical layout, and for any viewport width < 768px, it should render as a bottom bar with horizontal layout.

**Validates: Requirements 2.1**

### Property 3: Navigation Styling Consistency

*For any* viewport width, the navigation bar should maintain the same gold accent color (#D4AF37) for active states and the same icon/label styling.

**Validates: Requirements 2.4**

### Property 4: Hero Carousel Responsive Items

*For any* tablet viewport (768-1023px), the hero carousel should display exactly 2 book covers, and for any desktop viewport (≥ 1024px), it should display exactly 3 book covers.

**Validates: Requirements 3.1, 3.2**

### Property 5: Boudoir Grid Responsiveness

*For any* tablet viewport, the Boudoir book grid should display 2 columns, and for any desktop viewport, it should display 3 columns.

**Validates: Requirements 3.3, 3.4**

### Property 6: Premium Aesthetic Preservation

*For any* viewport width and any component, the system should preserve the premium aesthetic elements: void black backgrounds (#050505), gold accents (#D4AF37), silk texture overlay, and gold glow shadows.

**Validates: Requirements 1.7, 3.7**

### Property 7: Library Catalog Grid View Responsiveness

*For any* tablet viewport with grid view active, the library catalog should display 3 book covers per row, and for any desktop viewport with grid view active, it should display 4 book covers per row.

**Validates: Requirements 4.1, 4.2**

### Property 8: Library Catalog List View Responsiveness

*For any* tablet viewport with list view active, the library catalog should display 2 book entries per row, and for any desktop viewport with list view active, it should display 1 book entry per row with expanded metadata.

**Validates: Requirements 4.3, 4.4**

### Property 9: Book Cover Aspect Ratio Invariant

*For any* viewport width and any layout mode, book cover images should maintain a 2:3 aspect ratio.

**Validates: Requirements 4.5**

### Property 10: Hover State Conditional Rendering

*For any* device with hover capability (detected via CSS media query `(hover: hover)`), interactive elements should display hover states including gold glow shadows, brightness increases, and scale transforms.

**Validates: Requirements 4.6, 13.1, 13.2, 13.3, 13.4**

### Property 11: Component Styling Consistency

*For any* viewport width, all components should maintain consistent styling with their mobile versions including card borders, shadows, button styles, and input field styling.

**Validates: Requirements 4.7, 11.3, 11.4, 11.5**

### Property 12: Novel Detail Two-Column Layout

*For any* tablet or desktop viewport (≥ 768px), the novel detail page should display cover image and metadata in a two-column layout with the cover on the left and metadata on the right.

**Validates: Requirements 5.1**

### Property 13: Novel Detail Cast Preview Responsiveness

*For any* tablet viewport, the cast preview should display 4 character portraits, and for any desktop viewport, it should display 6 character portraits.

**Validates: Requirements 5.4, 5.5**

### Property 14: Novel Detail Chapter List Grid

*For any* desktop viewport (≥ 1024px), the chapter list should display in a 2-column grid layout.

**Validates: Requirements 5.6**

### Property 15: Typography Consistency Across Breakpoints

*For any* viewport width, the system should maintain consistent typography including font families (Playfair Display, Cinzel, Literata, Marcellus), font sizes, and line heights as defined in the mobile version.

**Validates: Requirements 5.8, 6.4, 14.3**

### Property 16: Reading Room Text Centering

*For any* tablet or desktop viewport (≥ 768px), the reading room text content should be horizontally centered with a constrained max-width (680px for tablet, 720px for desktop).

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 17: Reading Room Component Preservation

*For any* viewport width, the reading room should preserve all interactive components including the Veil overlay, blur effects, unlock mechanism, and ornamental dividers.

**Validates: Requirements 6.7, 6.8**

### Property 18: Comments Sidebar Desktop Rendering

*For any* desktop viewport (≥ 1024px), the reading room should display comments in a fixed sidebar on the right side, and for any mobile or tablet viewport (< 1024px), comments should display below chapter content.

**Validates: Requirements 7.1, 7.5**

### Property 19: Comments Styling Consistency

*For any* viewport width, comment elements should maintain consistent styling including author names, timestamps, and gold accent colors on interactive elements.

**Validates: Requirements 7.6, 7.7**

### Property 20: Cast Gallery Grid Responsiveness

*For any* tablet viewport, the cast gallery should display 2 character cards per row, and for any desktop viewport, it should display 3 character cards per row.

**Validates: Requirements 8.1, 8.2**

### Property 21: Cast Gallery Interaction Preservation

*For any* viewport width, the cast gallery should preserve all interactive features including card flip animations, portrait aspect ratios, rose endorsement buttons with animations, and trophy badge conditional rendering.

**Validates: Requirements 8.3, 8.4, 8.5, 8.6**

### Property 22: Cast Gallery Styling Preservation

*For any* viewport width, character cards should maintain nameplate gradient overlays and typography styling.

**Validates: Requirements 8.7**

### Property 23: Authors Study Two-Column Layout

*For any* tablet or desktop viewport (≥ 768px), the author's study should display biography and bibliography in a two-column layout with biography on the left (35% width) and bibliography on the right (65% width).

**Validates: Requirements 9.1**

### Property 24: Authors Study Trophy Case Grid

*For any* tablet viewport, the trophy case should display in a 3-column grid, and for any desktop viewport, it should display in a 4-column grid.

**Validates: Requirements 9.6, 9.7**

### Property 25: Authors Study Styling Preservation

*For any* viewport width, the author's study should maintain gold border styling on avatars and trophies.

**Validates: Requirements 9.8**

### Property 26: Vault Grid Responsiveness

*For any* tablet viewport, the vault should display credit packages in a 2-column grid, and for any desktop viewport, it should display in a 3-column grid.

**Validates: Requirements 10.1, 10.2**

### Property 27: Vault Styling Preservation

*For any* viewport width, the vault should maintain burgundy "Most Popular" ribbons, coin rain animations, and consistent card styling with gold borders and shadows.

**Validates: Requirements 10.5, 10.6, 10.7**

### Property 28: Authentication Form Centering

*For any* tablet or desktop viewport (≥ 768px), authentication forms should be horizontally centered with a maximum width of 480px.

**Validates: Requirements 11.2**

### Property 29: Authentication Form Consistency

*For any* viewport width, authentication forms should maintain consistent validation message positioning, vertical spacing, and typography hierarchy.

**Validates: Requirements 11.6**

### Property 30: Profile Stats Layout Responsiveness

*For any* tablet or desktop viewport (≥ 768px), the profile page should display reading stats in a horizontal row layout.

**Validates: Requirements 12.1**

### Property 31: Profile Followed Authors Responsiveness

*For any* tablet viewport, the followed authors strip should display 6 avatars, and for any desktop viewport, it should display 8 avatars.

**Validates: Requirements 12.2, 12.3**

### Property 32: Profile Library Grid Responsiveness

*For any* tablet viewport, the profile library should display novels in a 2-column grid, and for any desktop viewport, it should display in a 3-column grid.

**Validates: Requirements 12.4, 12.5**

### Property 33: Profile Styling Preservation

*For any* viewport width, the profile page should maintain hexagonal avatar styling and gold accent colors.

**Validates: Requirements 12.6, 12.7**

### Property 34: Touch Interaction Preservation

*For any* touch-enabled device regardless of viewport size, the system should maintain all touch interactions, click events, and tap animations.

**Validates: Requirements 13.5, 13.6**

### Property 35: Cursor Pointer on Interactive Elements

*For any* interactive element (buttons, links, cards) across all viewport widths, the system should apply cursor: pointer styling.

**Validates: Requirements 13.7**

### Property 36: Color Token Consistency

*For any* viewport width and any component, all colors used should match the existing color tokens: primary (#D4AF37), void (#050505), surface (#121212), accent (#800020), text-main (#EAEAEA), text-muted (#8A8A8A).

**Validates: Requirements 14.2**

### Property 37: Asset Reusability

*For any* viewport width, the system should reuse existing SVG icons, ornamental dividers, and the silk texture background pattern without duplication.

**Validates: Requirements 14.5, 14.6**

### Property 38: Shimmer Placeholder Consistency

*For any* viewport width, loading states should use the same shimmer placeholder components with dimensions adjusted to match the responsive layout.

**Validates: Requirements 15.1, 15.2**

### Property 39: Shimmer Placeholder Grid Responsiveness

*For any* tablet viewport, shimmer placeholders should display 2 per row, and for any desktop viewport, they should display 3 per row.

**Validates: Requirements 15.3, 15.4**

### Property 40: Image Lazy Loading

*For any* viewport width, images below the fold should be lazy loaded, and all images should maintain their aspect ratios during loading to prevent layout shift.

**Validates: Requirements 15.5, 15.6**

## Error Handling

### Viewport Detection Failures

**Scenario**: JavaScript fails to execute or viewport detection hook fails

**Handling Strategy**: 
- CSS media queries provide fallback layout detection
- Server-side rendering delivers mobile layout by default
- Progressive enhancement ensures core functionality works without JavaScript

**Implementation**:
```typescript
// Graceful degradation in useViewport hook
export function useViewport() {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  
  useEffect(() => {
    try {
      const updateViewport = () => {
        const width = window.innerWidth;
        if (width >= BREAKPOINTS.desktop) setViewport('desktop');
        else if (width >= BREAKPOINTS.tablet) setViewport('tablet');
        else setViewport('mobile');
      };
      
      updateViewport();
      window.addEventListener('resize', updateViewport);
      return () => window.removeEventListener('resize', updateViewport);
    } catch (error) {
      console.error('Viewport detection failed:', error);
      // Fallback to mobile layout
      setViewport('mobile');
    }
  }, []);
  
  return viewport;
}
```

### Image Loading Failures

**Scenario**: Book cover images fail to load on any viewport

**Handling Strategy**:
- Display placeholder with book icon (existing pattern)
- Maintain aspect ratio to prevent layout shift
- Preserve card styling and interactions

**Implementation**: Already handled by existing NovelCard component with fallback UI

### Responsive Grid Overflow

**Scenario**: Content exceeds expected grid dimensions

**Handling Strategy**:
- Use CSS Grid with `minmax()` for flexible sizing
- Apply `overflow: hidden` or `text-overflow: ellipsis` for text content
- Ensure cards have minimum dimensions to prevent collapse

**Implementation**:
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--grid-gap);
}
```

### Transition Performance Issues

**Scenario**: Animations lag during viewport transitions on low-end devices

**Handling Strategy**:
- Use `prefers-reduced-motion` media query to disable animations
- Limit animations to transform and opacity (GPU-accelerated)
- Provide instant layout changes as fallback

**Implementation**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Hover State Detection Failures

**Scenario**: Hover media query not supported or incorrectly detected

**Handling Strategy**:
- Default to showing hover states (better than hiding them)
- Touch events take precedence over hover on hybrid devices
- Ensure all interactions work without hover feedback

**Implementation**:
```css
/* Default: enable hover states */
.interactive-element:hover {
  box-shadow: var(--gold-glow);
}

/* Disable on touch-only devices */
@media (hover: none) {
  .interactive-element:hover {
    box-shadow: none;
  }
}
```

### Content Overflow in Fixed Sidebars

**Scenario**: Comments sidebar content exceeds viewport height on desktop

**Handling Strategy**:
- Apply `overflow-y: auto` to sidebar container
- Maintain fixed positioning for sidebar chrome
- Add scroll indicators (fade gradient) at top/bottom

**Implementation**:
```typescript
<aside className="fixed right-0 top-0 bottom-0 w-[320px] flex flex-col">
  <div className="flex-1 overflow-y-auto">
    {/* Scrollable comments */}
  </div>
</aside>
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and exact dimension values
- Specific breakpoint values (768px, 1024px)
- Exact dimensions (280px nav width, 680px text width, 48px margins)
- Component rendering at specific viewports
- CSS class application
- Specific interaction examples

**Property-Based Tests**: Focus on universal properties across all inputs
- Layout correctness across viewport ranges
- Styling consistency across breakpoints
- Grid responsiveness with varying content counts
- Aspect ratio preservation with different image dimensions
- Hover state behavior across device types

### Property-Based Testing Configuration

**Library Selection**: 
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- Installation: `npm install --save-dev fast-check @types/fast-check`

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: responsive-tablet-desktop-views, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';
import { describe, it, expect } from '@jest/globals';

describe('Responsive Tablet Desktop Views', () => {
  // Feature: responsive-tablet-desktop-views, Property 1: Viewport Layout Mapping
  it('should render correct layout tier for any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport widths
        (viewportWidth) => {
          const layout = getLayoutForViewport(viewportWidth);
          
          if (viewportWidth < 768) {
            expect(layout).toBe('mobile');
          } else if (viewportWidth < 1024) {
            expect(layout).toBe('tablet');
          } else {
            expect(layout).toBe('desktop');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: responsive-tablet-desktop-views, Property 9: Book Cover Aspect Ratio Invariant
  it('should maintain 2:3 aspect ratio for book covers across all viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport width
        fc.record({
          width: fc.integer({ min: 100, max: 400 }),
          height: fc.integer({ min: 150, max: 600 }),
        }), // cover dimensions
        (viewportWidth, coverDimensions) => {
          const aspectRatio = coverDimensions.width / coverDimensions.height;
          const expectedRatio = 2 / 3;
          const tolerance = 0.01;
          
          expect(Math.abs(aspectRatio - expectedRatio)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Test Organization**:
```
src/app/_components/__tests__/
├── navigation-bar.responsive.test.tsx
├── hero-carousel.responsive.test.tsx
├── library-catalog.responsive.test.tsx
├── novel-detail.responsive.test.tsx
├── reading-room.responsive.test.tsx
├── cast-gallery.responsive.test.tsx
├── author-profile.responsive.test.tsx
├── vault.responsive.test.tsx
├── profile.responsive.test.tsx
└── auth-forms.responsive.test.tsx
```

**Unit Test Examples**:

```typescript
import { render, screen } from '@testing-library/react';
import { NavigationBar } from '../navigation-bar';

describe('NavigationBar Responsive', () => {
  it('should have 280px max-width on tablet viewport', () => {
    // Mock viewport width
    global.innerWidth = 768;
    
    const { container } = render(<NavigationBar activeTab="boudoir" />);
    const nav = container.querySelector('nav');
    
    const styles = window.getComputedStyle(nav!);
    expect(styles.maxWidth).toBe('280px');
  });

  it('should display navigation items vertically on desktop', () => {
    global.innerWidth = 1024;
    
    const { container } = render(<NavigationBar activeTab="boudoir" />);
    const nav = container.querySelector('nav');
    
    const styles = window.getComputedStyle(nav!);
    expect(styles.flexDirection).toBe('column');
  });
});
```

### Visual Regression Testing

**Tool**: Playwright with screenshot comparison

**Test Scenarios**:
- Capture screenshots at 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop)
- Compare against baseline images
- Test all major views: Boudoir, Library, Novel Detail, Reading Room, Cast Gallery, Author's Study, Vault, Profile

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Responsive Visual Regression', () => {
  test('Boudoir layout at tablet breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('boudoir-tablet.png');
  });

  test('Boudoir layout at desktop breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('boudoir-desktop.png');
  });
});
```

### Integration Testing

**Focus Areas**:
- Navigation transitions between breakpoints
- Grid reflow when resizing viewport
- Sidebar appearance/disappearance on Reading Room
- Hover state activation on pointer devices
- Touch interaction preservation on tablets

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Responsive Integration', () => {
  test('should transition navigation from bottom to side when resizing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check bottom navigation
    const navMobile = await page.locator('nav').boundingBox();
    expect(navMobile?.y).toBeGreaterThan(500);
    
    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for transition
    
    // Check side navigation
    const navTablet = await page.locator('nav').boundingBox();
    expect(navTablet?.x).toBe(0);
    expect(navTablet?.width).toBeLessThanOrEqual(280);
  });
});
```

### Performance Testing

**Metrics to Monitor**:
- First Contentful Paint (FCP) across breakpoints
- Largest Contentful Paint (LCP) for hero images
- Cumulative Layout Shift (CLS) during viewport transitions
- Time to Interactive (TTI) on tablet/desktop

**Targets**:
- FCP < 1.5s on all viewports
- LCP < 2.5s on all viewports
- CLS < 0.1 (minimal layout shift)
- TTI < 3.5s on all viewports

**Tools**:
- Lighthouse CI for automated performance testing
- WebPageTest for detailed waterfall analysis
- Chrome DevTools Performance panel for profiling

### Accessibility Testing

**Focus Areas**:
- Keyboard navigation works across all breakpoints
- Focus indicators visible on all interactive elements
- Screen reader announcements for layout changes
- Touch target sizes meet WCAG guidelines (44x44px minimum)

**Tools**:
- axe-core for automated accessibility testing
- Manual testing with screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing

### Test Coverage Goals

- **Unit Tests**: 80% code coverage for responsive components
- **Property Tests**: All 40 correctness properties implemented
- **Visual Regression**: 100% coverage of major views at 3 breakpoints
- **Integration Tests**: All critical user flows tested across breakpoints
- **Performance Tests**: All pages meet performance targets at all breakpoints

