/**
 * Unified Stripe webhook handler.
 *
 * Single Dashboard endpoint → POST /api/webhooks/stripe
 * ( /api/webhooks/payment re-exports the same handler for backwards compatibility )
 *
 * Event: checkout.session.completed
 * - Credit packs: metadata.type=credit_pack + pack_id → grant credits
 * - Paperback: metadata.type=paperback + novel_id → record order
 */

import { sql } from "@/lib/db/postgres";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { insertPaperbackOrder } from "@/lib/db/paperback-orders";
import { CREDIT_PACKS, type PackId } from "@/lib/stripe/config";

function ack() {
  return NextResponse.json({ received: true });
}

async function grantCreditPack(params: {
  eventId: string;
  readerId: string;
  packId: string;
}): Promise<NextResponse> {
  const { eventId, readerId, packId } = params;

  if (!(packId in CREDIT_PACKS)) {
    console.error("Stripe webhook: unknown pack_id", packId);
    return NextResponse.json({ error: "Unknown pack" }, { status: 400 });
  }

  const credits = CREDIT_PACKS[packId as PackId].credits;
  const client = await sql.connect();

  try {
    await client.sql`BEGIN`;

    const { rows: inserted } = await client.sql<{ stripe_event_id: string }>`
      INSERT INTO processed_payment_events (stripe_event_id)
      VALUES (${eventId})
      ON CONFLICT (stripe_event_id) DO NOTHING
      RETURNING stripe_event_id
    `;
    if (inserted.length === 0) {
      await client.sql`COMMIT`;
      return ack();
    }

    const { rows: readerRows } = await client.sql<{ credit_balance: number }>`
      SELECT credit_balance FROM readers
      WHERE id = ${readerId}
      FOR UPDATE
    `;

    if (readerRows.length === 0) {
      await client.sql`ROLLBACK`;
      console.error("Stripe webhook: reader not found", readerId);
      return NextResponse.json({ error: "Reader not found" }, { status: 400 });
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
    console.error("Stripe webhook credit grant error:", err);
    return NextResponse.json(
      { error: "Failed to grant credits" },
      { status: 500 }
    );
  } finally {
    client.release();
  }

  return ack();
}

async function recordPaperbackOrder(
  session: Stripe.Checkout.Session,
  readerId: string,
  novelId: string
): Promise<NextResponse> {
  const shipping =
    session.collected_information?.shipping_details ??
    (
      session as Stripe.Checkout.Session & {
        shipping_details?: {
          name?: string | null;
          address?: Stripe.Address | null;
        } | null;
      }
    ).shipping_details ??
    null;

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
      shippingName: shipping?.name ?? null,
      shippingAddress: shipping?.address
        ? (shipping.address as unknown as Record<string, unknown>)
        : null,
      status: "paid",
    });
  } catch (err) {
    console.error("Stripe webhook: failed to record paperback order", err);
    return NextResponse.json(
      { error: "Failed to record order" },
      { status: 500 }
    );
  }

  return ack();
}

/**
 * Verify Stripe signature and dispatch checkout.session.completed
 * to credit-pack or paperback handlers.
 */
export async function handleStripeWebhook(
  request: NextRequest
): Promise<NextResponse> {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error(
      "Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET"
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 }
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

  if (event.type !== "checkout.session.completed") {
    return ack();
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const readerId = session.metadata?.reader_id;
  const packId = session.metadata?.pack_id;
  const novelId = session.metadata?.novel_id;
  const checkoutType = session.metadata?.type;

  const isCreditPack =
    checkoutType === "credit_pack" ||
    (Boolean(packId) && checkoutType !== "paperback" && !novelId);

  const isPaperback =
    checkoutType === "paperback" ||
    (Boolean(novelId) && checkoutType !== "credit_pack" && !packId);

  if (isCreditPack) {
    if (!packId) {
      return ack();
    }
    if (!readerId) {
      console.error("Stripe webhook: missing reader_id for credit pack", {
        packId,
      });
      return NextResponse.json(
        { error: "Missing session metadata" },
        { status: 400 }
      );
    }
    return grantCreditPack({
      eventId: event.id,
      readerId,
      packId,
    });
  }

  if (isPaperback) {
    if (!novelId) {
      return ack();
    }
    if (!readerId) {
      console.error("Stripe webhook: missing reader_id for paperback", {
        novelId,
      });
      return NextResponse.json(
        { error: "Missing session metadata" },
        { status: 400 }
      );
    }
    return recordPaperbackOrder(session, readerId, novelId);
  }

  return ack();
}
