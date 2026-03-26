# Requirements: Buy Paperback

## Introduction

Add a paperback purchase flow to the Midnight Satin app, allowing readers to buy physical copies of novels they enjoy. A "Buy Paperback" button on the Novel Detail page leads to a purchase page that initially shows a "Coming Soon" state. The full flow is planned around Stripe Checkout for payment, with price calculated from the novel's page count or word count, and shipping address collection for physical fulfillment.

## Glossary

- **Novel_Detail_Page**: The existing screen at `/novel/[novelId]` displaying a novel's hero image, synopsis, characters, and chapter list.
- **Novel_Detail_Header**: The fixed navigation header on the Novel Detail Page containing back, bookmark, and share buttons.
- **Buy_Paperback_Button**: A new button in the Novel Detail Header that navigates to the Paperback Purchase Page.
- **Paperback_Purchase_Page**: A new page at `/novel/[novelId]/paperback` where readers can purchase a physical copy.
- **Coming_Soon_State**: The initial placeholder state of the Paperback Purchase Page before Stripe integration is live.
- **Price_Calculator**: A module that computes the paperback price from a novel's word count or page count.
- **Stripe_Checkout_Session**: A server-side Stripe API session created to process the paperback payment.
- **Shipping_Address_Form**: A form collecting the reader's name and shipping address for physical delivery.
- **Order_Record**: A database row storing the paperback order details after successful payment.

## Requirements

### Requirement 1: Buy Paperback Button on Novel Detail Header

**User Story:** As a reader, I want to see a "Buy Paperback" button on the Novel Detail page, so that I can navigate to the paperback purchase flow.

#### Acceptance Criteria

1. THE Novel_Detail_Header SHALL display a Buy_Paperback_Button to the right of the back button on the left side of the header.
2. THE Buy_Paperback_Button SHALL use the `menu_book` Material Symbols Outlined icon, matching the existing header button styling: 40×40px rounded-full, `bg-surface/30 backdrop-blur-md`, `border border-white/10`, with hover and active states.
3. WHEN a reader taps the Buy_Paperback_Button, THE Novel_Detail_Page SHALL navigate to `/novel/[novelId]/paperback`.
4. THE Buy_Paperback_Button SHALL include an `aria-label` of "Get the paperback" for accessibility.

### Requirement 2: Paperback Purchase Page — Coming Soon State

**User Story:** As a reader, I want to see a "Coming Soon" message on the paperback purchase page, so that I know the feature is planned but not yet available.

#### Acceptance Criteria

1. THE Paperback_Purchase_Page SHALL be accessible at the route `/novel/[novelId]/paperback`.
2. WHILE the Stripe integration is not yet live, THE Paperback_Purchase_Page SHALL display a Coming_Soon_State.
3. THE Coming_Soon_State SHALL display the novel's cover image, title (Playfair Display, italic, bold), and author name.
4. THE Coming_Soon_State SHALL display a "Coming Soon" heading in Cinzel font, uppercase, with gold text (`text-primary`).
5. THE Coming_Soon_State SHALL display a personalized body message using the template: "Love doesn't have to stay behind a screen. Get a high-quality, physical edition of {novel title} to keep forever." in Literata font, followed by a note that this feature is coming soon.
6. THE Coming_Soon_State SHALL display a "Back to Novel" button styled as `btn-gold` (gold background, void text, uppercase tracking) that navigates back to the Novel Detail Page.
7. THE Paperback_Purchase_Page SHALL include a back arrow button in the header matching the Novel Detail Header back button styling.
8. THE Paperback_Purchase_Page SHALL use the void black background, surface card styling, and gold accents consistent with the Tactile Noir Luxury design theme.

### Requirement 3: Price Calculation Based on Novel Length

**User Story:** As a platform operator, I want paperback prices calculated from the novel's word count, so that pricing reflects the physical production cost of each book.

#### Acceptance Criteria

1. THE Price_Calculator SHALL compute the paperback price using the formula: base cost + (word count × per-word rate).
2. THE Price_Calculator SHALL use a configurable base cost defaulting to $13.99 USD.
3. THE Price_Calculator SHALL use a configurable per-word rate defaulting to $0.00006 USD per word.
4. THE Price_Calculator SHALL derive word count by summing the word counts of all chapters belonging to the novel.
5. THE Price_Calculator SHALL round the final price to two decimal places.
6. THE Price_Calculator SHALL return a minimum price equal to the base cost when the novel has zero chapters or zero words.
7. IF the computed price exceeds a configurable maximum (defaulting to $34.99 USD), THEN THE Price_Calculator SHALL cap the price at the maximum.
8. THE Price_Calculator SHALL expose a pure function `calculatePaperbackPrice(wordCount: number, config?: PricingConfig): number` for testability.

### Requirement 4: Word Count Derivation from Novel Chapters

**User Story:** As a developer, I need a function to compute the total word count for a novel from its chapter content, so that the price calculator has accurate input.

#### Acceptance Criteria

1. THE Content_Layer SHALL expose a function `getNovelWordCount(novelId: string): Promise<number>` that returns the total word count across all chapters of the specified novel.
2. THE word count function SHALL count words by splitting chapter content on whitespace boundaries and counting non-empty tokens.
3. WHEN a novel has no chapters, THE word count function SHALL return zero.
4. FOR ALL novels, computing the word count and then computing the price SHALL produce a deterministic result (round-trip property: same chapters always yield the same price).

### Requirement 5: Stripe Checkout Session Creation

**User Story:** As a reader, I want to pay for a paperback using Stripe, so that I can securely complete the purchase with my credit card.

#### Acceptance Criteria

1. WHEN a reader confirms the paperback purchase, THE Paperback_Purchase_Page SHALL call a server action to create a Stripe_Checkout_Session.
2. THE server action SHALL create a Stripe Checkout session in `payment` mode with a single line item for the paperback.
3. THE line item SHALL include the novel title as the product name, the computed price in USD cents, and quantity of 1.
4. THE Stripe_Checkout_Session SHALL collect the shipping address using Stripe's `shipping_address_collection` with allowed countries including US, CA, GB, AU, and EU member states.
5. THE Stripe_Checkout_Session SHALL set `success_url` to `/novel/[novelId]/paperback/success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url` to `/novel/[novelId]/paperback`.
6. THE server action SHALL store the novel ID and reader ID in the Stripe session metadata.
7. IF the Stripe API call fails, THEN THE server action SHALL return a descriptive error message without exposing internal Stripe error details.
8. THE server action SHALL require an authenticated session; IF the reader is not authenticated, THEN THE server action SHALL return an authentication error.

### Requirement 6: Shipping Address Collection

**User Story:** As a reader, I want to provide my shipping address during checkout, so that the paperback can be delivered to my location.

#### Acceptance Criteria

1. THE Stripe_Checkout_Session SHALL use Stripe's built-in `shipping_address_collection` to collect the reader's full name, street address, city, state/province, postal code, and country.
2. THE Stripe_Checkout_Session SHALL restrict shipping to a configurable list of allowed country codes.
3. WHEN the checkout is completed, THE shipping address SHALL be available in the Stripe session object for fulfillment processing.

### Requirement 7: Order Recording After Successful Payment

**User Story:** As a platform operator, I want paperback orders recorded in the database after payment, so that fulfillment can be tracked.

#### Acceptance Criteria

1. THE system SHALL provide a `paperback_orders` database table with columns: `id` (UUID PK), `reader_id` (UUID FK), `novel_id` (UUID FK), `stripe_session_id` (TEXT UNIQUE NOT NULL), `stripe_payment_intent_id` (TEXT), `amount_cents` (INT NOT NULL), `currency` (TEXT DEFAULT 'usd'), `shipping_name` (TEXT), `shipping_address` (JSONB), `status` (TEXT DEFAULT 'paid'), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
2. THE system SHALL provide a `PaperbackOrder` TypeScript interface in `src/lib/db/types.ts` matching the table schema.
3. WHEN a Stripe webhook confirms payment success (`checkout.session.completed`), THE system SHALL create an Order_Record with the payment details and shipping address from the Stripe session.
4. IF an Order_Record with the same `stripe_session_id` already exists, THEN THE system SHALL skip creation to ensure idempotent processing.

### Requirement 8: Stripe Webhook Handler

**User Story:** As a developer, I need a webhook endpoint to receive Stripe payment confirmations, so that orders are recorded reliably regardless of client-side redirects.

#### Acceptance Criteria

1. THE system SHALL expose an API route at `/api/webhooks/stripe` that accepts POST requests from Stripe.
2. THE webhook handler SHALL verify the Stripe webhook signature using the `STRIPE_WEBHOOK_SECRET` environment variable.
3. IF the signature verification fails, THEN THE webhook handler SHALL return HTTP 400 and log the verification failure.
4. WHEN a `checkout.session.completed` event is received with metadata containing a `novel_id`, THE webhook handler SHALL create or update the corresponding Order_Record.
5. THE webhook handler SHALL return HTTP 200 after successful processing to acknowledge receipt.
6. THE webhook handler SHALL be idempotent: processing the same event multiple times SHALL produce the same result.

### Requirement 9: Purchase Success Page

**User Story:** As a reader, I want to see a confirmation after purchasing a paperback, so that I know my order was placed successfully.

#### Acceptance Criteria

1. THE system SHALL provide a success page at `/novel/[novelId]/paperback/success`.
2. THE success page SHALL display a confirmation message with the novel title and a "Your paperback is on its way" heading in Cinzel font, gold text.
3. THE success page SHALL display an order summary including the novel title, price paid, and a note that shipping details were collected.
4. THE success page SHALL include a "Back to Novel" button styled as `btn-gold` navigating to the Novel Detail Page.
5. THE success page SHALL use the void black background and Tactile Noir Luxury design theme.
6. IF the `session_id` query parameter is missing or invalid, THEN THE success page SHALL redirect to the Novel Detail Page.

### Requirement 10: Purchase Page — Active State (Post Coming Soon)

**User Story:** As a reader, I want to see the paperback price and purchase option when the feature is live, so that I can buy the book.

#### Acceptance Criteria

1. WHEN the Stripe integration is live (controlled by a feature flag or environment variable `NEXT_PUBLIC_PAPERBACK_ENABLED`), THE Paperback_Purchase_Page SHALL display the active purchase state instead of the Coming Soon state.
2. THE active state SHALL display the novel's cover image, title, author name, and computed paperback price formatted as USD (e.g., "$14.99").
3. THE active state SHALL display a "Get The Paperback" button styled as `btn-gold` that initiates the Stripe Checkout flow.
4. THE active state SHALL display a personalized body message using the template: "Love doesn't have to stay behind a screen. Get a high-quality, physical edition of {novel title} to keep forever." in Literata font, along with the call-to-action "Get an actual paperback copy of this novel shipped to you now!"
5. WHILE the Stripe Checkout session is being created, THE "Get The Paperback" button SHALL display a loading state and be disabled to prevent duplicate submissions.
6. IF the reader is not authenticated, THEN THE Paperback_Purchase_Page SHALL display a prompt to log in before purchasing, with a link to the login page that returns to the paperback page after authentication.
7. THE active state SHALL display the estimated page count (word count ÷ 250, rounded up) as supplementary information.

### Requirement 11: Environment Configuration

**User Story:** As a developer, I need environment variables for Stripe and feature flags, so that the paperback feature can be toggled and configured per environment.

#### Acceptance Criteria

1. THE system SHALL use the environment variable `STRIPE_SECRET_KEY` for server-side Stripe API calls.
2. THE system SHALL use the environment variable `STRIPE_WEBHOOK_SECRET` for webhook signature verification.
3. THE system SHALL use the environment variable `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for client-side Stripe.js initialization.
4. THE system SHALL use the environment variable `NEXT_PUBLIC_PAPERBACK_ENABLED` (values: `"true"` or `"false"`) to toggle between Coming Soon and active purchase states.
5. THE `.env.example` file SHALL document all new environment variables with placeholder values.
