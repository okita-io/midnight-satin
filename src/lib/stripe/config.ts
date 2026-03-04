/**
 * Stripe configuration for credit pack purchases (Req 8.4).
 * Maps pack IDs to Stripe Price IDs. Configure via env vars in production.
 */

export const CREDIT_PACKS = {
  pouch: { credits: 50, priceCents: 499, name: "Pouch of Dust" },
  handful: { credits: 150, priceCents: 1299, name: "Handful of Gold" },
  chest: { credits: 500, priceCents: 3999, name: "Chest of Riches" },
  royal: { credits: 1200, priceCents: 8999, name: "Royal Treasury" },
} as const;

export type PackId = keyof typeof CREDIT_PACKS;

/** Stripe Price IDs per pack (set in production). Fallback: use ad-hoc mode. */
export function getStripePriceId(packId: PackId): string | null {
  const envKey = `STRIPE_PRICE_${packId.toUpperCase()}` as const;
  return process.env[envKey] ?? null;
}

/** Whether Stripe is configured (secret key present). */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
