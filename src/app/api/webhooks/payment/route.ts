/**
 * Legacy Stripe webhook path — same unified handler as /api/webhooks/stripe.
 *
 * Prefer configuring Stripe Dashboard to:
 *   POST https://<host>/api/webhooks/stripe
 *
 * Kept so an older payment-only endpoint URL still works with the same
 * STRIPE_WEBHOOK_SECRET (do not register both URLs as separate Stripe endpoints).
 */

export { POST } from "../stripe/route";
