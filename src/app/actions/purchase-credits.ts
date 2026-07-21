"use server";

/**
 * Purchase credits server action (Req 8.4-8.6).
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Credit grant happens via webhook on checkout.session.completed (idempotent).
 */

import { getAppBaseUrl } from "@/lib/app-url";
import { getSession } from "@/lib/auth/session";
import {
  CREDIT_PACKS,
  getStripePriceId,
  isStripeConfigured,
  type PackId,
} from "@/lib/stripe/config";
import Stripe from "stripe";

export type PurchaseCreditsResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

const VALID_PACK_IDS = Object.keys(CREDIT_PACKS) as PackId[];

function isValidPackId(id: string): id is PackId {
  return VALID_PACK_IDS.includes(id as PackId);
}

/**
 * Initiate a credit pack purchase. Creates a Stripe Checkout session and returns
 * the URL to redirect the user to complete payment.
 * Credits are granted by the webhook on successful payment (idempotent).
 */
export async function purchaseCredits(
  packId: string
): Promise<PurchaseCreditsResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sign in to purchase credits." };
  }

  if (!isValidPackId(packId)) {
    return { success: false, error: "Invalid credit pack." };
  }

  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Payment system is not configured. Please try again later.",
    };
  }

  const pack = CREDIT_PACKS[packId];
  const priceId = getStripePriceId(packId);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const baseUrl = await getAppBaseUrl();

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] =
      priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: pack.name,
                  description: `${pack.credits} credits for Midnight Satin`,
                },
                unit_amount: pack.priceCents,
              },
              quantity: 1,
            },
          ];

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/vault?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/vault?canceled=1`,
      metadata: {
        type: "credit_pack",
        reader_id: session.readerId,
        pack_id: packId,
      },
      customer_email: session.email,
    });

    const url = checkoutSession.url;
    if (!url) {
      return {
        success: false,
        error: "Failed to create checkout session. Please try again.",
      };
    }

    return { success: true, checkoutUrl: url };
  } catch (err) {
    console.error("purchaseCredits error:", err);
    return {
      success: false,
      error: "Failed to start checkout. Please try again.",
    };
  }
}
