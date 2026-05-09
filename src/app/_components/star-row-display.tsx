import { StarIcon } from "./star-primitives";

interface StarRowDisplayProps {
  value: number;
  size: 16 | 18 | 24;
  className?: string;
  /** When true, renders half-stars (for decimal averages) */
  allowHalf?: boolean;
  ariaLabel?: string;
}

function getStarFill(value: number, allowHalf: boolean) {
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.floor(clamped);
  const frac = clamped - full;
  const hasHalf = allowHalf && frac >= 0.25 && frac < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return { full, hasHalf, empty };
}

export function StarRowDisplay({
  value,
  size,
  className = "",
  allowHalf = false,
  ariaLabel,
}: StarRowDisplayProps) {
  if (value <= 0) return null;
  const { full, hasHalf, empty } = getStarFill(value, allowHalf);

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`.trim()}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      {Array.from({ length: full }).map((_, i) => (
        <StarIcon key={`full-${i}`} size={size} tone="active" aria-hidden />
      ))}
      {hasHalf && <StarIcon size={size} tone="half" variant="half" aria-hidden />}
      {Array.from({ length: empty }).map((_, i) => (
        <StarIcon key={`empty-${i}`} size={size} tone="inactive" aria-hidden />
      ))}
    </div>
  );
}

