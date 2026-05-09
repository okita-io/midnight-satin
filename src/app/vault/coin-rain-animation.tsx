"use client";

/**
 * Coin rain overlay shown on successful purchase (Req 8.5).
 * Renders gold coin particles falling from top to bottom.
 */
interface CoinRainAnimationProps {
  isActive: boolean;
}

const COIN_SLOT_KEYS = [
  "coin-slot-a",
  "coin-slot-b",
  "coin-slot-c",
  "coin-slot-d",
  "coin-slot-e",
  "coin-slot-f",
  "coin-slot-g",
  "coin-slot-h",
  "coin-slot-i",
  "coin-slot-j",
  "coin-slot-k",
  "coin-slot-l",
] as const;

export function CoinRainAnimation({ isActive }: CoinRainAnimationProps) {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
      aria-hidden
    >
      {COIN_SLOT_KEYS.map((coinKey, slot) => (
        <div
          key={coinKey}
          className="absolute animate-coin-fall text-primary"
          style={{
            left: `${8 + (slot * 7) % 84}%`,
            animationDelay: `${slot * 0.15}s`,
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
