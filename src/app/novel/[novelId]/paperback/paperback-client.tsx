"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
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
  /** When false, checkout stays disabled (e.g. print partner TBD). */
  purchaseEnabled: boolean;
}

function FeatureRow({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 text-left">
      <span
        className="material-symbols-outlined text-primary/90 text-xl shrink-0 mt-0.5"
        aria-hidden
      >
        {icon}
      </span>
      <div>
        <p className="font-marcellus text-white/90 text-sm tracking-wide">
          {title}
        </p>
        <p className="font-literata text-white/55 text-xs leading-relaxed mt-0.5">
          {children}
        </p>
      </div>
    </div>
  );
}

export function PaperbackClient({
  novelId,
  novelTitle,
  authorName,
  coverImageUrl,
  priceCents,
  wordCount,
  isAuthenticated,
  purchaseEnabled,
}: PaperbackClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceFormatted = `$${(priceCents / 100).toFixed(2)}`;
  const estimatedPages = wordCount === 0 ? 0 : Math.ceil(wordCount / 250);
  const wordCountDisplay = wordCount.toLocaleString();

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
    <div className="w-full flex flex-col gap-6 xs:gap-8">
      {/* Hero card: .card from globals (Tactile Noir) */}
      <div className="card w-full p-6 xs:p-8 flex flex-col items-center gap-6">
        <div className="overlay-sheen" aria-hidden />

        {coverImageUrl && (
          <div className="relative z-10 w-44 xs:w-52 aspect-[2/3] rounded-sm shadow-lg border border-white/10 overflow-hidden">
            <Image
              src={coverImageUrl}
              alt={novelTitle}
              fill
              className="object-contain"
              sizes="(max-width: 480px) 11rem, 13rem"
              unoptimized
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <h2 className="font-playfair italic font-semibold text-2xl xs:text-3xl text-white gold-text-shadow">
            {novelTitle}
          </h2>
          <p className="font-marcellus text-white/60 text-sm tracking-wide">
            by {authorName}
          </p>
        </div>

        <div className="relative z-10 w-16 h-px bg-primary/30" />

        <p className="relative z-10 font-literata text-white/70 text-center leading-relaxed text-sm px-1">
          Love doesn&apos;t have to stay behind a screen. Get a high-quality,
          physical edition of{" "}
          <span className="italic text-white">{novelTitle}</span> to keep
          forever.
        </p>

        <p className="relative z-10 font-literata text-white/60 text-sm text-center">
          Get an actual paperback copy of this novel shipped to you soon.
        </p>
      </div>

      <section
        className="w-full bg-surface/80 border border-primary/20 rounded-sm p-5 xs:p-6 space-y-4 shadow-[0px_2px_12px_rgba(212,175,55,0.08)]"
        aria-labelledby="edition-heading"
      >
        <h3
          id="edition-heading"
          className="font-cinzel text-primary text-xs tracking-[0.2em] uppercase text-center"
        >
          The physical edition
        </h3>

        <div className="space-y-4 pt-1">
          <FeatureRow icon="auto_stories" title="Trade-quality paperback">
            Professionally bound softcover sized for your shelf, printed once
            our fulfillment partner is finalized.
          </FeatureRow>
          <FeatureRow icon="local_shipping" title="Shipped to your door">
            Full name and shipping address collected securely at checkout when
            purchases open.
          </FeatureRow>
          <FeatureRow icon="contract" title="Order tracking">
            You&apos;ll receive confirmation after payment; fulfillment details
            will follow by email.
          </FeatureRow>
        </div>
      </section>

      <section
        className="card w-full p-5 xs:p-6"
        aria-labelledby="summary-heading"
      >
        <div className="overlay-sheen" aria-hidden />
        <h3
          id="summary-heading"
          className="relative z-10 font-cinzel text-white/90 text-[11px] tracking-widest uppercase mb-4 text-center"
        >
          Order estimate
        </h3>
        <dl className="relative z-10 space-y-3 text-sm">
          <div className="flex justify-between gap-4 font-literata">
            <dt className="text-white/50">Estimated length</dt>
            <dd className="text-white/85 tabular-nums">
              ~{estimatedPages} pages ({wordCountDisplay} words)
            </dd>
          </div>
          <div className="flex justify-between gap-4 items-baseline">
            <dt className="font-literata text-white/50">
              Price <span className="text-white/35">(est.)</span>
            </dt>
            <dd className="font-cinzel text-primary text-xl tracking-wide tabular-nums">
              {priceFormatted}
            </dd>
          </div>
        </dl>
        <p className="relative z-10 font-literata text-white/40 text-[11px] leading-relaxed mt-4 text-center">
          Final total, taxes, and shipping may adjust at checkout based on
          printer and destination.
        </p>
      </section>

      {error && (
        <p
          className="font-ui text-sm text-red-400/90 text-center px-2"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="w-full flex flex-col items-center gap-3 pb-2">
        {!purchaseEnabled ? (
          <>
            <button
              type="button"
              disabled
              className="btn-gold w-full max-w-sm opacity-50 cursor-not-allowed"
            >
              Buy now
            </button>
            <p className="font-literata text-white/45 text-xs text-center max-w-sm leading-relaxed">
              Checkout is paused while we choose a print-on-demand partner for
              this launch. The button will unlock once fulfillment is wired up.
            </p>
            {isAuthenticated ? (
              <p className="font-literata text-white/35 text-[11px] text-center">
                You&apos;re signed in; no need to do anything else for now.
              </p>
            ) : (
              <p className="font-literata text-white/45 text-xs text-center max-w-sm">
                <Link
                  href={`/auth/login?returnUrl=${encodeURIComponent(`/novel/${novelId}/paperback`)}`}
                  className="text-primary border-b border-primary/50 pb-0.5 hover:opacity-90"
                >
                  Sign in
                </Link>{" "}
                so you&apos;re ready when we flip the switch.
              </p>
            )}
          </>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="btn-gold w-full max-w-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing…" : "Buy now"}
          </button>
        ) : (
          <p className="font-literata text-white/50 text-sm text-center max-w-sm">
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
    </div>
  );
}
