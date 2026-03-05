# Implementation Plan: Responsive Tablet and Desktop Views

## Overview

This implementation plan converts the responsive tablet and desktop views design into actionable coding tasks. The implementation follows a progressive enhancement approach, starting with the responsive foundation, then extending each component with tablet/desktop layouts while maintaining the premium Tactile Noir Luxury aesthetic. All tasks build incrementally, with property-based tests integrated throughout to validate correctness properties early.

**Technology Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, fast-check (property-based testing)

**Key Implementation Strategy**:
- Extend existing components with responsive props rather than creating duplicates
- Use Tailwind's `md:` (768px) and `lg:` (1024px) breakpoints
- Maintain CSS/asset reusability throughout
- Integrate property-based tests as sub-tasks to catch errors early
- Test all 40 correctness properties from the design document

## Tasks

- [ ] 1. Set up responsive system foundation
  - Install fast-check for property-based testing: `npm install --save-dev fast-check @types/fast-check`
  - Create `src/lib/responsive/constants.ts` with breakpoint constants and grid configurations
  - Create `src/lib/responsive/hooks.ts` with `useViewport()` and `usePointerDevice()` hooks
  - Create `src/lib/responsive/utils.ts` with viewport detection utilities
  - Add responsive utility classes to `src/app/globals.css`
  - _Requirements: 1.1, 1.2, 1.6_

- [ ]* 1.1 Write property tests for responsive foundation
  - **Property 1: Viewport Layout Mapping** - Test correct layout tier for any viewport width
  - **Property 36: Color Token Consistency** - Test color tokens match across viewports
  - **Validates: Requirements 1.3, 1.4, 1.5, 14.2**

- [ ] 2. Implement responsive navigation system
  - [ ] 2.1 Extend NavigationBar component with side panel layout
    - Modify `src/app/_components/navigation-bar.tsx` to support `layout` prop
    - Add CSS for side panel: 280px width, vertical flex, fixed positioning
    - Implement smooth transition animation (300ms ease-in-out)
    - Add media queries for automatic layout switching at 768px
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 2.2 Write property tests for navigation
    - **Property 2: Navigation Layout Transformation** - Test bottom/side layout by viewport
    - **Property 3: Navigation Styling Consistency** - Test gold accents preserved
    - **Validates: Requirements 2.1, 2.4**


- [ ] 3. Implement responsive Boudoir (Home) layout
  - [ ] 3.1 Extend HeroCarousel component for multi-item display
    - Modify `src/app/_components/hero-carousel.tsx` to accept `itemsPerView` prop
    - Implement 2-column layout for tablet (md: breakpoint)
    - Implement 3-column layout for desktop (lg: breakpoint)
    - Adjust heights: 480px tablet, 520px desktop
    - Add responsive gap spacing: 24px tablet, 32px desktop
    - _Requirements: 3.1, 3.2_

  - [ ] 3.2 Extend grid sections with responsive columns
    - Modify grid section components (High Society, Current Affairs, Players)
    - Replace horizontal scroll with CSS Grid on tablet/desktop
    - Implement 2-column grid for tablet, 3-column for desktop
    - Add max-width 1440px constraint and center on desktop
    - Maintain spacious feel with appropriate gaps
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.8_

  - [ ]* 3.3 Write property tests for Boudoir layout
    - **Property 4: Hero Carousel Responsive Items** - Test 2 items tablet, 3 desktop
    - **Property 5: Boudoir Grid Responsiveness** - Test 2 cols tablet, 3 cols desktop
    - **Property 6: Premium Aesthetic Preservation** - Test void black, gold accents preserved
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.7, 1.7**

- [ ] 4. Implement responsive Library Catalog
  - [ ] 4.1 Extend LibraryCatalog grid view
    - Modify `src/app/_components/library-catalog.tsx` grid view
    - Implement 3-column grid for tablet (md: breakpoint)
    - Implement 4-column grid for desktop (lg: breakpoint)
    - Add responsive gap: 24px tablet, 32px desktop
    - _Requirements: 4.1, 4.2_

  - [ ] 4.2 Extend LibraryCatalog list view
    - Implement 2-column list layout for tablet
    - Implement single-column expanded layout for desktop
    - Add expanded metadata fields for desktop (author bio, tags, rating, chapter count)
    - Adjust card dimensions: 160px cover width, 240px height for desktop list
    - _Requirements: 4.3, 4.4_

  - [ ] 4.3 Add hover states to catalog items
    - Implement gold glow shadow on hover using `usePointerDevice()` hook
    - Add brightness increase and scale transforms
    - Use CSS `@media (hover: hover)` for pointer device detection
    - _Requirements: 4.6_

  - [ ]* 4.4 Write property tests for Library Catalog
    - **Property 7: Library Catalog Grid View Responsiveness** - Test 3 cols tablet, 4 cols desktop
    - **Property 8: Library Catalog List View Responsiveness** - Test 2 cols tablet, 1 col desktop
    - **Property 9: Book Cover Aspect Ratio Invariant** - Test 2:3 ratio maintained
    - **Property 10: Hover State Conditional Rendering** - Test hover states on pointer devices
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 6. Implement responsive Novel Detail page
  - [ ] 6.1 Create two-column layout for NovelDetailHeader
    - Modify `src/app/_components/novel-detail-header.tsx` (or equivalent)
    - Implement two-column layout for tablet/desktop: 40% cover, 60% metadata
    - Add responsive gap: 48px tablet, 64px desktop
    - Implement sticky positioning for cover column
    - Maintain parallax effect on cover image
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [ ] 6.2 Extend cast preview section
    - Modify cast preview to show 4 portraits on tablet
    - Modify cast preview to show 6 portraits on desktop
    - Maintain horizontal scroll with larger portrait sizes
    - _Requirements: 5.4, 5.5_

  - [ ] 6.3 Implement two-column chapter list for desktop
    - Add CSS Grid for chapter list on desktop (lg: breakpoint)
    - Implement 2-column layout for faster scanning
    - Maintain single column on mobile/tablet
    - _Requirements: 5.6_

  - [ ]* 6.4 Write property tests for Novel Detail
    - **Property 12: Novel Detail Two-Column Layout** - Test 2-col layout tablet/desktop
    - **Property 13: Novel Detail Cast Preview Responsiveness** - Test 4 portraits tablet, 6 desktop
    - **Property 14: Novel Detail Chapter List Grid** - Test 2-col grid desktop
    - **Property 15: Typography Consistency Across Breakpoints** - Test font families preserved
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6, 5.8**

- [ ] 7. Implement responsive Reading Room
  - [ ] 7.1 Add max-width constraints to chapter content
    - Modify `src/app/_components/reading-room/chapter-content.tsx` (or equivalent)
    - Set max-width 680px for tablet, 720px for desktop
    - Center content horizontally
    - Add responsive side margins: 48px tablet, 64px desktop
    - Maintain 18px font size and 1.6 line height
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 7.2 Create CommentsSidebar component for desktop
    - Create new `src/app/_components/reading-room/comments-sidebar.tsx`
    - Implement fixed positioning on right side
    - Set width to 320px
    - Add independent scrolling
    - Show only on desktop (lg: breakpoint), hide on mobile/tablet
    - Reuse existing comment styling (dark background, gold accents)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 7.3 Write property tests for Reading Room
    - **Property 16: Reading Room Text Centering** - Test max-width and centering
    - **Property 17: Reading Room Component Preservation** - Test Veil, blur, unlock preserved
    - **Property 18: Comments Sidebar Desktop Rendering** - Test sidebar desktop, below mobile/tablet
    - **Property 19: Comments Styling Consistency** - Test comment styling preserved
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.7, 6.8, 7.1, 7.5, 7.6, 7.7**

- [ ] 8. Implement responsive Cast Gallery
  - [ ] 8.1 Extend CastGallery grid layout
    - Modify `src/app/_components/cast-gallery.tsx` (or equivalent)
    - Implement 2-column grid for tablet (md: breakpoint)
    - Implement 3-column grid for desktop (lg: breakpoint)
    - Add responsive gap: 24px tablet, 32px desktop
    - Maintain portrait aspect ratio and quality
    - Preserve card flip interaction for backstory reveal
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 8.2 Maintain character card interactions
    - Preserve rose endorsement button positioning and animation
    - Display trophy badges when endorsement count exceeds threshold
    - Maintain nameplate gradient overlay and typography
    - _Requirements: 8.5, 8.6, 8.7_

  - [ ]* 8.3 Write property tests for Cast Gallery
    - **Property 20: Cast Gallery Grid Responsiveness** - Test 2 cols tablet, 3 cols desktop
    - **Property 21: Cast Gallery Portrait Aspect Ratio** - Test portrait aspect ratio maintained
    - **Property 22: Cast Gallery Interaction Preservation** - Test flip, endorsement, badges preserved
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7**

- [ ] 9. Implement responsive Author's Study
  - [ ] 9.1 Create two-column layout for biography and bibliography
    - Modify `src/app/_components/authors-study.tsx` (or equivalent)
    - Implement two-column layout for tablet/desktop: 35% biography, 65% bibliography
    - Add responsive gap: 48px tablet, 64px desktop
    - Maintain single column on mobile
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 9.2 Extend hexagonal avatar sizing
    - Set avatar size to 180px on tablet
    - Set avatar size to 220px on desktop
    - Maintain hexagonal shape and gold border
    - _Requirements: 9.4, 9.5, 9.8_

  - [ ] 9.3 Extend trophy case grid layout
    - Implement 3-column grid for tablet
    - Implement 4-column grid for desktop
    - Maintain gold border styling on trophies
    - _Requirements: 9.6, 9.7, 9.8_

  - [ ]* 9.4 Write property tests for Author's Study
    - **Property 23: Authors Study Two-Column Layout** - Test 35/65 split tablet/desktop
    - **Property 24: Authors Study Trophy Case Grid** - Test 3 cols tablet, 4 cols desktop
    - **Property 25: Authors Study Styling Preservation** - Test gold borders preserved
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement responsive Vault layout
  - [ ] 11.1 Extend Vault credit packages grid
    - Modify `src/app/_components/vault.tsx` (or equivalent)
    - Implement 2-column grid for tablet (md: breakpoint)
    - Implement 3-column grid for desktop (lg: breakpoint)
    - Add responsive gap: 24px tablet, 32px desktop
    - _Requirements: 10.1, 10.2_

  - [ ] 11.2 Extend credit balance display
    - Set font size to 48px on tablet
    - Set font size to 56px on desktop
    - Maintain prominent positioning at top
    - _Requirements: 10.3, 10.4_

  - [ ] 11.3 Maintain Vault styling and animations
    - Preserve burgundy "Most Popular" ribbon on highlighted packages
    - Maintain coin rain animation on successful purchase
    - Preserve consistent card styling with gold borders and shadows
    - _Requirements: 10.5, 10.6, 10.7_

  - [ ]* 11.4 Write property tests for Vault
    - **Property 26: Vault Grid Responsiveness** - Test 2 cols tablet, 3 cols desktop
    - **Property 27: Vault Styling Preservation** - Test ribbons, animations, card styling preserved
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

- [ ] 12. Implement responsive authentication pages
  - [ ] 12.1 Center authentication forms on tablet/desktop
    - Modify authentication form components (sign-in, register)
    - Set maximum width to 480px for tablet/desktop
    - Center forms horizontally using margin auto
    - Maintain all input field styling including gold focus states
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 12.2 Preserve authentication form styling
    - Maintain button styling and hover effects
    - Preserve vertical spacing and typography hierarchy
    - Keep validation messages in same position as mobile
    - _Requirements: 11.4, 11.5, 11.6_

  - [ ]* 12.3 Write property tests for authentication pages
    - **Property 28: Authentication Form Centering** - Test 480px max-width and centering
    - **Property 29: Authentication Form Consistency** - Test validation, spacing, typography preserved
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

- [ ] 13. Implement responsive Profile page
  - [ ] 13.1 Extend profile stats layout
    - Modify `src/app/_components/profile.tsx` (or equivalent)
    - Display reading stats in horizontal row on tablet/desktop
    - Maintain vertical stack on mobile
    - _Requirements: 12.1_

  - [ ] 13.2 Extend followed authors strip
    - Display 6 avatars visible on tablet
    - Display 8 avatars visible on desktop
    - Maintain hexagonal avatar styling
    - _Requirements: 12.2, 12.3, 12.6_

  - [ ] 13.3 Extend profile library grid
    - Implement 2-column grid for tablet
    - Implement 3-column grid for desktop
    - Add responsive gap: 24px tablet, 32px desktop
    - _Requirements: 12.4, 12.5_

  - [ ] 13.4 Preserve profile styling
    - Maintain hexagonal avatar styling for followed authors
    - Preserve all gold accent colors and typography
    - _Requirements: 12.6, 12.7_

  - [ ]* 13.5 Write property tests for Profile page
    - **Property 30: Profile Stats Layout Responsiveness** - Test horizontal row tablet/desktop
    - **Property 31: Profile Followed Authors Responsiveness** - Test 6 avatars tablet, 8 desktop
    - **Property 32: Profile Library Grid Responsiveness** - Test 2 cols tablet, 3 cols desktop
    - **Property 33: Profile Styling Preservation** - Test hexagonal avatars, gold accents preserved
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement touch and hover interaction parity
  - [ ] 15.1 Add hover states to interactive elements
    - Implement gold glow shadow on hover for book cards (already done in task 4.3)
    - Add brightness increase on hover for buttons
    - Add scale transform on hover for floating action buttons
    - Use CSS `@media (hover: hover)` for pointer device detection
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 15.2 Preserve touch interactions
    - Maintain all touch interactions for touch-enabled tablets
    - Preserve all click and tap animations
    - Apply cursor pointer to all interactive elements
    - _Requirements: 13.5, 13.6, 13.7_

  - [ ]* 15.3 Write property tests for touch and hover interactions
    - **Property 34: Touch Interaction Preservation** - Test touch interactions maintained
    - **Property 35: Cursor Pointer on Interactive Elements** - Test cursor pointer applied
    - **Property 10: Hover State Conditional Rendering** - Test hover states on pointer devices (already covered in task 4.4)
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7**

- [ ] 16. Verify asset and style reusability
  - [ ] 16.1 Audit CSS class reusability
    - Verify all existing Tailwind CSS utility classes are reused
    - Verify all existing color tokens are reused without modification
    - Verify all existing typography definitions are reused
    - Verify component props extended rather than new components created
    - _Requirements: 14.1, 14.2, 14.3, 14.7_

  - [ ] 16.2 Audit asset reusability
    - Verify all existing image assets reused without duplicates
    - Verify all existing SVG icons and ornamental dividers reused
    - Verify silk texture background pattern reused
    - _Requirements: 14.4, 14.5, 14.6_

  - [ ]* 16.3 Write property tests for asset reusability
    - **Property 36: Color Token Consistency** - Test color tokens match across viewports
    - **Property 37: Asset Reusability** - Test SVG icons, dividers, textures reused
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7**

- [ ] 17. Implement performance and loading states
  - [ ] 17.1 Extend shimmer loading placeholders
    - Verify shimmer placeholders reused across all breakpoints
    - Adjust shimmer placeholder dimensions to match responsive layouts
    - Display 2 shimmer placeholders per row on tablet
    - Display 3 shimmer placeholders per row on desktop
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ] 17.2 Implement image lazy loading
    - Add lazy loading to images below the fold on all viewports
    - Maintain image aspect ratios during loading to prevent layout shift
    - Preserve all transition animations when switching between breakpoints
    - _Requirements: 15.5, 15.6, 15.7_

  - [ ]* 17.3 Write property tests for performance and loading
    - **Property 38: Shimmer Placeholder Consistency** - Test shimmer components reused with adjusted dimensions
    - **Property 39: Shimmer Placeholder Grid Responsiveness** - Test 2 per row tablet, 3 per row desktop
    - **Property 40: Image Lazy Loading** - Test lazy loading and aspect ratio preservation
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7**

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- All 40 correctness properties from the design document are covered in property test tasks
- Checkpoints ensure incremental validation at reasonable breaks
- Property tests validate universal correctness properties across viewport ranges
- Unit tests should validate specific examples and edge cases
- This is a Next.js 16 monolith using App Router, React 19, TypeScript, and Tailwind CSS
- Use `npm` for package management (not pnpm or yarn)
- fast-check library is used for property-based testing with minimum 100 iterations per test

