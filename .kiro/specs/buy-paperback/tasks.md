# Implementation Plan: Buy Paperback

## Overview

Add a paperback purchase flow to Midnight Satin: a Buy Paperback button on the Novel Detail Header, a purchase page with Coming Soon / Active states, Stripe Checkout integration, webhook-based order recording, and a success confirmation page. Implementation follows existing Stripe patterns from the credit purchase flow. All code is TypeScript.

## Tasks

- [x] 1. Create pricing module and word count utilities
  - [x] 1.1 Create `src/lib/paperback/pricing.ts` with `PricingConfig` interface, `DEFAULT_PRICING_CONFIG`, and `calculatePaperbackPrice` pure function
    - Implement formula: `min(baseCostCents + round(wordCount * perWordRate * 100), maxPriceCents)`
    - Ensure result is always an integer ≥ `baseCostCents`
    - Accept optional partial config merged with defaults
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8_

  - [x] 1.2 Create `src/lib/paperback/word-count.ts` with `countWords` pure function and `getNovelWordCount` async function
    - `countWords`: split on `/\s+/`, count non-empty tokens, return 0 for empty/whitespace-only strings
    - `getNovelWordCount`: fetch all chapters for a novel via `getChapters`, sum `countWords` per chapter
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.3 Write property tests for price calculation (Property 1)
    - **Property 1: Price calculation with cap**
    - Generate random `wordCount` (0–1,000,000) and random `PricingConfig`
    - Assert result equals `min(base + round(wc * rate * 100), max)` and result ≥ base and result is integer
    - Test file: `src/__tests__/properties/paperback-pricing.test.ts`
    - **Validates: Requirements 3.1, 3.5, 3.6, 3.7**

  - [x] 1.4 Write property tests for word count (Properties 2, 3)
    - **Property 2: Word count whitespace splitting**
    - Generate random strings with varied whitespace; assert `countWords` matches reference implementation
    - **Property 3: Word count additivity across chapters**
    - Generate random arrays of strings; assert sum of individual `countWords` equals `countWords` of joined string
    - Test file: `src/__tests__/properties/paperback-word-count.test.ts`
    - **Validates: Requirements 4.2, 4.3, 3.4, 4.4**

  - [x] 1.5 Write property test for page count estimation (Property 4)
    - **Property 4: Page count estimation**
    - Generate random word counts; assert `Math.ceil(wordCount / 250)` with minimum 0 for zero words
    - Test file: `src/__tests__/properties/paperback-pricing.test.ts` (append)
    - **Validates: Requirements 10.7**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Add data model and DB layer
  - [x] 3.1 Add `PaperbackOrder` interface to `src/lib/db/types.ts`
    - Fields: id, readerId, novelId, stripeSessionId, stripePaymentIntentId, amountCents, currency, shippingName, shippingAddress, status, createdAt, updatedAt
    - _Requirements: 7.1, 7.2_

  - [x] 3.2 Add `paperback_orders` table DDL to `src/lib/db/schema.sql`
    - Include UNIQUE constraint on `stripe_session_id` for idempotency
    - Add indexes on `reader_id`, `novel_id`, `stripe_session_id`
    - _Requirements: 7.1_

  - [x] 3.3 Create `src/lib/db/paperback-orders.ts` with `insertPaperbackOrder` function
    - Use `ON CONFLICT (stripe_session_id) DO NOTHING` for idempotent inserts
    - Accept order data and return the inserted row or null if duplicate
    - _Requirements: 7.3, 7.4_

- [x] 4. Add Buy Paperback button to Novel Detail Header
  - [x] 4.1 Modify `src/app/_components/novel-detail-header.tsx` to add a `menu_book` icon button
    - Place to the right of the back button, wrap both in a flex container
    - Use `next/link` with `href={/novel/${novelId}/paperback}`
    - Reuse the exact same button styling as the existing back/bookmark/share buttons: 40×40px rounded-full, `bg-surface/30 backdrop-blur-md`, `border border-white/10`
    - Add `aria-label="Get the paperback"`
    - Reference `reference/the_novel_detail.html` for header layout and spacing conventions
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Write property test for navigation URL correctness (Property 5)
    - **Property 5: Navigation URL correctness**
    - Generate random novel ID strings; assert button href equals `/novel/${novelId}/paperback`
    - Test file: `src/__tests__/properties/paperback-navigation.test.ts`
    - **Validates: Requirements 1.3, 2.6, 9.4**

- [x] 5. Implement Paperback Purchase Page (Coming Soon state)
  - [x] 5.1 Create `src/app/novel/[novelId]/paperback/page.tsx` as a Server Component
    - Fetch novel data (title, cover, author name) and word count
    - Check `NEXT_PUBLIC_PAPERBACK_ENABLED` env var
    - Check authentication status via `getCurrentSession`
    - Return `notFound()` if novel doesn't exist
    - Render Coming Soon state or Active state based on feature flag
    - _Requirements: 2.1, 2.2, 2.7, 2.8, 10.1_

  - [x] 5.2 Implement Coming Soon state UI within the page
    - Conform to the Tactile Noir Luxury design system — reuse existing Tailwind classes (`bg-void`, `bg-surface`, `text-primary`, `btn-gold`, `font-playfair`, `font-cinzel`, `font-literata`, `font-marcellus`) and component patterns from other pages
    - Display novel cover image, title (Playfair Display, italic, bold), author name
    - "Coming Soon" heading (Cinzel, uppercase, gold `text-primary`)
    - Personalized body: "Love doesn't have to stay behind a screen. Get a high-quality, physical edition of {novel title} to keep forever." (Literata)
    - Note that this feature is coming soon
    - "Back to Novel" button — reuse `btn-gold` class
    - Back arrow in header — reuse the same back button styling from Novel Detail Header
    - Void black background, surface card styling, gold accents
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 5.3 Write property test for feature flag determines page state (Property 6)
    - **Property 6: Feature flag determines page state**
    - Assert Coming Soon renders when flag is not `"true"`, active state renders when flag is `"true"`
    - Test file: `src/__tests__/properties/paperback-purchase-page.test.ts`
    - **Validates: Requirements 2.2, 10.1**

  - [x] 5.4 Write property test for Coming Soon state renders novel data (Property 7)
    - **Property 7: Coming Soon state renders novel data**
    - Generate random novel titles and author names; assert both appear in rendered output
    - Test file: `src/__tests__/properties/paperback-purchase-page.test.ts` (append)
    - **Validates: Requirements 2.3**

- [x] 6. Implement Active Purchase State (client component)
  - [x] 6.1 Create `src/app/novel/[novelId]/paperback/paperback-client.tsx` as a Client Component
    - Conform to the app's existing look and feel — reuse Tailwind utility classes, font families, color tokens, and component patterns
    - Display novel cover, title, author, computed price formatted as "$X.XX"
    - Personalized body message (Literata) and CTA: "Get an actual paperback copy of this novel shipped to you now!"
    - Estimated page count (word count ÷ 250, rounded up)
    - "Get The Paperback" button — reuse `btn-gold` styling with loading/disabled state during checkout creation
    - Login prompt if unauthenticated — link to login page with return URL to `/novel/${novelId}/paperback`
    - Call `createPaperbackCheckout` server action on button click, then `window.location.href` redirect to Stripe
    - Display error message from server action if checkout fails
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 6.2 Write property test for active state displays formatted price (Property 15)
    - **Property 15: Active state displays formatted price**
    - Generate random price in cents; assert formatted as USD string (e.g., `$14.99` for 1499 cents)
    - Test file: `src/__tests__/properties/paperback-purchase-page.test.ts` (append)
    - **Validates: Requirements 10.2**

  - [x] 6.3 Write property test for login prompt includes return URL (Property 16)
    - **Property 16: Login prompt includes return URL**
    - Generate random novel IDs; assert login link includes return URL to `/novel/${novelId}/paperback`
    - Test file: `src/__tests__/properties/paperback-purchase-page.test.ts` (append)
    - **Validates: Requirements 10.6**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement server action for Stripe Checkout
  - [x] 8.1 Create `src/app/actions/paperback.ts` with `createPaperbackCheckout` server action
    - Follow existing `purchaseCredits` pattern from `src/app/actions/purchase-credits.ts`
    - Verify authenticated session, fetch novel, compute word count and price
    - Create Stripe Checkout session with: `mode: "payment"`, single line item (novel title, price cents, qty 1), `shipping_address_collection` with allowed countries, `success_url` and `cancel_url`, metadata with `novel_id` and `reader_id`
    - Return `{ success: true, checkoutUrl }` or `{ success: false, error }` with sanitized error messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3_

  - [x] 8.2 Write property test for checkout session params (Property 8)
    - **Property 8: Checkout session params correctness**
    - Mock Stripe client; generate random novel titles, prices, reader IDs
    - Assert `stripe.checkout.sessions.create` call contains correct line item, success/cancel URLs, and metadata
    - Test file: `src/__tests__/properties/paperback-checkout.test.ts`
    - **Validates: Requirements 5.3, 5.5, 5.6**

  - [x] 8.3 Write property test for error message sanitization (Property 9)
    - **Property 9: Error message sanitization**
    - Generate random Stripe error messages; assert returned error does not contain original message, API key fragments, or request IDs
    - Test file: `src/__tests__/properties/paperback-checkout.test.ts` (append)
    - **Validates: Requirements 5.7**

- [x] 9. Implement Stripe webhook handler
  - [x] 9.1 Create `src/app/api/webhooks/stripe/route.ts` with POST handler
    - Follow existing `/api/webhooks/payment/route.ts` pattern
    - Verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set
    - Read raw body, verify Stripe signature
    - On `checkout.session.completed` with `novel_id` in metadata: extract fields, insert into `paperback_orders` with idempotent upsert
    - Return HTTP 200 on success, HTTP 400 on invalid signature or missing metadata, HTTP 500 on config/DB errors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 7.3, 7.4_

  - [x] 9.2 Write property test for webhook idempotency (Property 11)
    - **Property 11: Webhook idempotency**
    - Mock DB; send same event payload twice; assert only one insert occurs
    - Test file: `src/__tests__/properties/paperback-webhook.test.ts`
    - **Validates: Requirements 7.4, 8.6**

  - [x] 9.3 Write property test for webhook rejects invalid signatures (Property 12)
    - **Property 12: Webhook rejects invalid signatures**
    - Generate random bodies and invalid signatures; assert HTTP 400 response and no order records created
    - Test file: `src/__tests__/properties/paperback-webhook.test.ts` (append)
    - **Validates: Requirements 8.2, 8.3**

- [x] 10. Implement Success Page
  - [x] 10.1 Create `src/app/novel/[novelId]/paperback/success/page.tsx` as a Server Component
    - Conform to the app's Tactile Noir Luxury theme — reuse existing design tokens, font classes, card styling, and layout patterns
    - Validate `session_id` query param; redirect to `/novel/${novelId}` if missing or invalid
    - Retrieve Stripe session to get novel title and amount paid
    - Display confirmation heading (Cinzel, gold), novel title, price paid
    - Note about shipping details collected
    - "Back to Novel" button — reuse `btn-gold` class
    - Void black background, surface card styling consistent with other pages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 10.2 Write property test for success page redirects on invalid session (Property 14)
    - **Property 14: Success page redirects on invalid session**
    - Generate random novel IDs; assert redirect to `/novel/${novelId}` when `session_id` is missing or invalid
    - Test file: `src/__tests__/properties/paperback-success.test.ts`
    - **Validates: Requirements 9.6**

- [x] 11. Update environment configuration
  - [x] 11.1 Update `.env.example` to document new environment variables
    - Add `NEXT_PUBLIC_PAPERBACK_ENABLED=false`
    - Document `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if not already present
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows existing Stripe patterns from `src/app/actions/purchase-credits.ts` and `src/app/api/webhooks/payment/route.ts`
- All code is TypeScript, matching the existing codebase
