"use client";

import { useRouter } from "next/navigation";

/**
 * Back button that navigates to the previous page, or falls back to home.
 */
export function BackButton() {
  const { back, push } = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          back();
        } else {
          push("/");
        }
      }}
      className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors font-ui text-sm tracking-wide"
      aria-label="Go back"
    >
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      Back
    </button>
  );
}
