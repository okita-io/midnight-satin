"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Themed error boundary: void background, gold accents, generic message.
 * No sensitive error details exposed. Option to return home.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Midnight Satin error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
      <div
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <p className="font-header text-sm tracking-[0.2em] text-primary uppercase mb-4">
          Something went wrong
        </p>
        <h1 className="font-display italic font-bold text-3xl md:text-4xl text-text-main mb-4">
          The candle flickered out
        </h1>
        <p className="font-ui text-text-muted text-sm mb-8 max-w-sm">
          We could not complete your request. Please try again or return to the Boudoir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-gold"
            aria-label="Try again"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-ui text-sm font-bold text-primary border border-primary py-3 px-6 rounded-sm hover:bg-primary hover:text-void transition-colors text-center"
            aria-label="Return to home"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
