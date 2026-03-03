"use client";

/**
 * Empty state message in Pinyon Script with gold color, per design system.
 * Examples: "No current affairs", "Nothing in high society yet", "Your shelf is waiting."
 */
interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <p
      className={`font-script text-2xl text-primary text-center ${className}`}
      style={{ fontFamily: "var(--font-script)" }}
    >
      {message}
    </p>
  );
}
