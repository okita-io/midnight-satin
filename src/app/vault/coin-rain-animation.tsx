"use client";

/**
 * Coin rain overlay shown on successful purchase (Req 8.5).
 * Renders gold coin particles falling from top to bottom.
 */
interface CoinRainAnimationProps {
  isActive: boolean;
}

const COIN_COUNT = 12;

export function CoinRainAnimation({ isActive }: CoinRainAnimationProps) {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: COIN_COUNT }, (_, i) => (
        <div
          key={i}
          className="absolute animate-coin-fall text-primary"
          style={{
            left: `${8 + (i * 7) % 84}%`,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            monetization_on
          </span>
        </div>
      ))}
    </div>
  );
}
