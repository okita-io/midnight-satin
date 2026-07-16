/**
 * Payment webhook handler (Req 8.4-8.6).
 * Processes Stripe checkout.session.completed with idempotent credit grant.
 * Uses processed_payment_events table to prevent duplicate credit grants.
 * Credits are derived from pack_id server-side (never trust client metadata amounts).
 */

import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CREDIT_PACKS, type PackId } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = event.id;
  const readerId = session.metadata?.reader_id;
  const packId = session.metadata?.pack_id;
  const checkoutType = session.metadata?.type;

  // Not a credit-pack checkout (e.g. paperback) — ACK so Stripe does not retry.
  if (
    checkoutType === "paperback" ||
    session.metadata?.novel_id ||
    !packId
  ) {
    return NextResponse.json({ received: true });
  }

  if (!readerId) {
    console.error("Webhook: missing reader_id metadata", { packId });
    return NextResponse.json(
      { error: "Missing session metadata" },
      { status: 400 }
    );
  }

  if (!(packId in CREDIT_PACKS)) {
    console.error("Webhook: unknown pack_id", packId);
    return NextResponse.json({ error: "Unknown pack" }, { status: 400 });
  }

  const credits = CREDIT_PACKS[packId as PackId].credits;

  const client = await sql.connect();
  try {
    await client.sql`BEGIN`;

    // Idempotency: INSERT ... ON CONFLICT DO NOTHING; if no row returned, already processed
    const { rows: inserted } = await client.sql<{ stripe_event_id: string }>`
      INSERT INTO processed_payment_events (stripe_event_id)
      VALUES (${eventId})
      ON CONFLICT (stripe_event_id) DO NOTHING
      RETURNING stripe_event_id
    `;
    if (inserted.length === 0) {
      await client.sql`COMMIT`;
      return NextResponse.json({ received: true });
    }

    // Lock reader row and grant credits (Property 6: payment credit invariant)
    const { rows: readerRows } = await client.sql<{ credit_balance: number }>`
      SELECT credit_balance FROM readers
      WHERE id = ${readerId}
      FOR UPDATE
    `;

    if (readerRows.length === 0) {
      await client.sql`ROLLBACK`;
      console.error("Webhook: reader not found", readerId);
      return NextResponse.json(
        { error: "Reader not found" },
        { status: 400 }
      );
    }

    await client.sql`
      UPDATE readers
      SET credit_balance = credit_balance + ${credits}
      WHERE id = ${readerId}
    `;

    await client.sql`
      INSERT INTO credit_transactions (reader_id, amount, transaction_type, related_entity_id)
      VALUES (${readerId}, ${credits}, 'purchase', NULL)
    `;

    await client.sql`COMMIT`;
  } catch (err) {
    try {
      await client.sql`ROLLBACK`;
    } catch {
      // ignore
    }
    console.error("Webhook credit grant error:", err);
    return NextResponse.json(
      { error: "Failed to grant credits" },
      { status: 500 }
    );
  } finally {
    client.release();
  }

  return NextResponse.json({ received: true });
}
