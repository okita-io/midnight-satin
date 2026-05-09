"use client";

import { StarIcon } from "./star-primitives";

interface StarRatingInputProps {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
  /** Visually hidden label for accessibility */
  label?: string;
}

const STARS = [1, 2, 3, 4, 5] as const;

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  label = "Your star rating",
}: StarRatingInputProps) {
  return (
    <div
      className="flex justify-center items-center gap-0.5 xs:gap-1 py-1"
      role="group"
      aria-label={label}
    >
      {STARS.map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            aria-label={`${n} out of 5 stars`}
            aria-pressed={active}
            className="p-1 rounded-sm touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed [@media(hover:hover)]:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
          >
            <StarIcon size={28} tone={active ? "active" : "inactive"} />
          </button>
        );
      })}
    </div>
  );
}
