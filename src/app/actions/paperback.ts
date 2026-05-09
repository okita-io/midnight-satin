"use server";

/**
 * Paperback checkout server action (Req 5.1–5.8, 6.1–6.3).
 * Creates a Stripe Checkout session for a paperback purchase and returns the redirect URL.
 * Order recording happens via webhook on checkout.session.completed (idempotent).
 */

import { getSession } from "@/lib/auth/session";
import { getNovel } from "@/lib/content";
import { getNovelWordCount } from "@/lib/paperback/word-count";
import { calculatePaperbackPrice } from "@/lib/paperback/pricing";
import { isStripeConfigured } from "@/lib/stripe/config";
import Stripe from "stripe";

export type PaperbackCheckoutResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

/**
 * Allowed shipping countries: US, CA, GB, AU + EU member states.
 */
function getAllowedShippingCountries(): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] {
  return [
    "US",
    "CA",
    "GB",
    "AU",
    // EU member states
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
  ];
}

/**
 * Create a Stripe Checkout session for a paperback purchase.
 * Returns the checkout URL on success, or a sanitized error message on failure.
 */
export async function createPaperbackCheckout(
  novelId: string
): Promise<PaperbackCheckoutResult> {
  // 1. Verify authenticated session
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sign in to purchase a paperback." };
  }

  // 2. Verify Stripe is configured
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Payment system is not configured. Please try again later.",
    };
  }

  // 3. Fetch novel (validate exists)
  const novel = await getNovel(novelId);
  if (!novel) {
    return { success: false, error: "Novel not found." };
  }

  // 4. Compute word count and price
  const wordCount = await getNovelWordCount(novelId);
  const priceCents = calculatePaperbackPrice(wordCount);

  // 5. Build URLs
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: novel.title,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: getAllowedShippingCountries(),
      },
      success_url: `${baseUrl}/novel/${novelId}/paperback/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/novel/${novelId}/paperback`,
      metadata: {
        novel_id: novelId,
        reader_id: session.readerId,
      },
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
    // Log full error server-side; return sanitized message to client
    console.error("createPaperbackCheckout error:", err);
    return {
      success: false,
      error: "Failed to start checkout. Please try again.",
    };
  }
}
