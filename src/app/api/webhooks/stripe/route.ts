/**
 * Stripe webhook handler for paperback orders.
 * Processes checkout.session.completed events with novel_id in metadata.
 * Uses ON CONFLICT (stripe_session_id) DO NOTHING for idempotent order recording.
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 7.3, 7.4
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { insertPaperbackOrder } from "@/lib/db/paperback-orders";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error(
      "Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET"
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Acknowledge non-checkout events
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const novelId = session.metadata?.novel_id;
  const readerId = session.metadata?.reader_id;

  if (!novelId || !readerId) {
    console.error("Stripe webhook: missing metadata", { novelId, readerId });
    return NextResponse.json(
      { error: "Missing session metadata" },
      { status: 400 }
    );
  }

  try {
    await insertPaperbackOrder({
      readerId,
      novelId,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      shippingName: session.shipping_details?.name ?? null,
      shippingAddress:
        (session.shipping_details?.address as Record<string, unknown>) ?? null,
      status: "paid",
    });
  } catch (err) {
    console.error("Stripe webhook: failed to record order", err);
    return NextResponse.json(
      { error: "Failed to record order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
