/**
 * Paperback orders database access layer.
 * Handles inserting orders with idempotent upsert on stripe_session_id.
 * Requirements: 7.3, 7.4
 */

import { sql } from "@vercel/postgres";
import type { PaperbackOrder } from "./types";

/** DB row shape for paperback_orders (snake_case from Postgres) */
interface PaperbackOrderDbRow {
  id: string;
  reader_id: string;
  novel_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  shipping_name: string | null;
  shipping_address: Record<string, unknown> | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

function rowToOrder(row: PaperbackOrderDbRow): PaperbackOrder {
  return {
    id: row.id,
    readerId: row.reader_id,
    novelId: row.novel_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    shippingName: row.shipping_name,
    shippingAddress: row.shipping_address,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Insert a paperback order. Uses ON CONFLICT (stripe_session_id) DO NOTHING
 * for idempotent webhook processing (Req 7.4).
 *
 * Returns the inserted PaperbackOrder, or null if a row with the same
 * stripe_session_id already exists (duplicate/replay).
 */
export async function insertPaperbackOrder(data: {
  readerId: string;
  novelId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: string;
  shippingName: string | null;
  shippingAddress: Record<string, unknown> | null;
  status: string;
}): Promise<PaperbackOrder | null> {
  const { rows } = await sql<PaperbackOrderDbRow>`
    INSERT INTO paperback_orders (
      reader_id,
      novel_id,
      stripe_session_id,
      stripe_payment_intent_id,
      amount_cents,
      currency,
      shipping_name,
      shipping_address,
      status
    ) VALUES (
      ${data.readerId},
      ${data.novelId},
      ${data.stripeSessionId},
      ${data.stripePaymentIntentId},
      ${data.amountCents},
      ${data.currency},
      ${data.shippingName},
      ${JSON.stringify(data.shippingAddress)},
      ${data.status}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING *
  `;

  if (rows.length === 0) return null;
  return rowToOrder(rows[0]);
}
