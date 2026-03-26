export interface PricingConfig {
  baseCostCents: number; // default: 1399 ($13.99)
  perWordRate: number; // default: 0.00006
  maxPriceCents: number; // default: 3499 ($34.99)
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseCostCents: 1399,
  perWordRate: 0.00006,
  maxPriceCents: 3499,
};

/**
 * Calculate the paperback price in cents from a word count.
 *
 * Formula: min(baseCostCents + round(wordCount * perWordRate * 100), maxPriceCents)
 * Result is always an integer >= baseCostCents.
 */
export function calculatePaperbackPrice(
  wordCount: number,
  config?: Partial<PricingConfig>
): number {
  const { baseCostCents, perWordRate, maxPriceCents } = {
    ...DEFAULT_PRICING_CONFIG,
    ...config,
  };

  const rawPrice = baseCostCents + Math.round(wordCount * perWordRate * 100);
  const capped = Math.min(rawPrice, maxPriceCents);

  // Ensure result is always at least baseCostCents and an integer
  return Math.max(Math.round(capped), baseCostCents);
}
