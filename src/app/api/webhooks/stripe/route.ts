/**
 * Canonical Stripe webhook endpoint.
 *
 * Configure ONE Dashboard endpoint:
 *   POST https://<host>/api/webhooks/stripe
 * Event: checkout.session.completed
 *
 * Handles credit-pack grants and paperback order recording
 * (see src/lib/stripe/webhook.ts).
 */

import type { NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe/webhook";

export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}
