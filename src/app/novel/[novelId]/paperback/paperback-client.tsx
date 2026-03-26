"use client";

import { useState } from "react";
import Link from "next/link";
import { createPaperbackCheckout } from "@/app/actions/paperback";

interface PaperbackClientProps {
  novelId: string;
  novelTitle: string;
  authorName: string;
  coverImageUrl: string | null;
  priceCents: number;
  wordCount: number;
  isAuthenticated: boolean;
}

export function PaperbackClient({
  novelId,
  novelTitle,
  authorName,
  coverImageUrl,
  priceCents,
  wordCount,
  isAuthenticated,
}: PaperbackClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceFormatted = `$${(priceCents / 100).toFixed(2)}`;
  const estimatedPages = wordCount === 0 ? 0 : Math.ceil(wordCount / 250);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const result = await createPaperbackCheckout(novelId);
      if (result.success) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-surface border border-white/5 rounded-sm p-8 flex flex-col items-center gap-6 shadow-card-depth">
      {/* Novel cover */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={novelTitle}
          className="w-48 h-auto rounded-sm shadow-lg border border-white/5"
        />
      )}

      {/* Title & author */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-playfair italic font-bold text-2xl text-white gold-text-shadow">
          {novelTitle}
        </h1>
        <p className="font-marcellus text-white/60 text-sm tracking-wide">
          by {authorName}
        </p>
      </div>

      {/* Divider */}
      <div className="w-16 h-px bg-primary/30" />

      {/* Price */}
      <p className="font-cinzel text-primary text-2xl tracking-wide">
        {priceFormatted}
      </p>

      {/* Estimated pages */}
      <p className="font-literata text-white/50 text-xs">
        ~{estimatedPages} pages
      </p>

      {/* Personalized body message */}
      <p className="font-literata text-white/70 text-center leading-relaxed text-sm">
        Love doesn&apos;t have to stay behind a screen. Get a high-quality,
        physical edition of{" "}
        <span className="italic text-white">{novelTitle}</span> to keep forever.
      </p>

      {/* CTA text */}
      <p className="font-literata text-white/60 text-sm text-center">
        Get an actual paperback copy of this novel shipped to you now!
      </p>

      {/* Error message */}
      {error && (
        <p className="font-ui text-sm text-red-400/90 text-center">
          {error}
        </p>
      )}

      {/* Action area */}
      {isAuthenticated ? (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-gold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing…" : "Get The Paperback"}
        </button>
      ) : (
        <p className="font-literata text-white/50 text-sm text-center mt-2">
          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(`/novel/${novelId}/paperback`)}`}
            className="text-primary border-b border-primary/50 pb-0.5 hover:opacity-90"
          >
            Sign in
          </Link>{" "}
          to purchase this paperback.
        </p>
      )}
    </div>
  );
}
