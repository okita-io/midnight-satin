"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPrompt } from "../_components/auth-prompt";
import { CoinRainAnimation } from "./coin-rain-animation";
import { purchaseCredits } from "../actions/purchase-credits";

/** Credit pack definition per Requirement 8.2 */
const CREDIT_PACKS = [
  {
    id: "pouch",
    name: "Pouch of Dust",
    credits: 50,
    price: "$4.99",
    icon: "savings",
    popular: false,
  },
  {
    id: "handful",
    name: "Handful of Gold",
    credits: 150,
    price: "$12.99",
    icon: "local_mall",
    popular: true,
  },
  {
    id: "chest",
    name: "Chest of Riches",
    credits: 500,
    price: "$39.99",
    icon: "rib_cage",
    popular: false,
  },
  {
    id: "royal",
    name: "Royal Treasury",
    credits: 1200,
    price: "$89.99",
    icon: "account_balance",
    popular: false,
  },
] as const;

interface VaultClientProps {
  isAuthenticated: boolean;
  purchaseSuccess?: boolean;
  purchaseCanceled?: boolean;
}

export function VaultClient({
  isAuthenticated,
  purchaseSuccess = false,
  purchaseCanceled = false,
}: VaultClientProps) {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoinRain, setShowCoinRain] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (purchaseSuccess) {
      setShowCoinRain(true);
      // Clear URL params only after coin rain animation completes (Req 8.5)
      const t = setTimeout(() => {
        setShowCoinRain(false);
        router.replace("/vault", { scroll: false });
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [purchaseSuccess, router]);

  useEffect(() => {
    if (purchaseCanceled) {
      router.replace("/vault", { scroll: false });
    }
  }, [purchaseCanceled, router]);

  async function handlePurchaseClick(packId: string) {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    setError(null);
    setPurchasingPackId(packId);
    try {
      const result = await purchaseCredits(packId);
      if (result.success) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setError(result.error);
    } finally {
      setPurchasingPackId(null);
    }
  }

  return (
    <>
      <main className="relative z-10 flex-1 px-3 xs:px-4 pb-24 overflow-y-auto">
        {/* Coin rain overlay on successful purchase (Req 8.5) */}
        <CoinRainAnimation isActive={showCoinRain} />

        {error && (
          <div
            className="mb-4 p-3 bg-accent/20 border border-accent/50 rounded-sm text-sm text-text-main"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Decoration line */}
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <span
            className="material-symbols-outlined text-primary text-[16px]"
            aria-hidden
          >
            diamond
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* CreditPackGrid — 2-col tablet (md), 3-col desktop (lg); gap 24px tablet, 32px desktop */}
        <div className="grid grid-cols-2 gap-3 xs:gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard
              key={pack.id}
              pack={pack}
              onPurchase={() => handlePurchaseClick(pack.id)}
              isPurchasing={purchasingPackId === pack.id}
            />
          ))}
        </div>

        {/* LegalLinks */}
        <div className="text-center mt-12 pb-8">
          <p className="font-ui text-[10px] text-text-muted/40 uppercase tracking-widest">
            Secure payment processed by Stripe
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link
              href="/terms"
              className="font-ui text-[10px] text-text-muted hover:text-primary underline decoration-primary/30 underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="font-ui text-[10px] text-text-muted hover:text-primary underline decoration-primary/30 underline-offset-4"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      <AuthPrompt
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        returnUrl="/vault"
        message="Sign in to purchase credit packs."
      />
    </>
  );
}

interface CreditPackCardProps {
  pack: (typeof CREDIT_PACKS)[number];
  onPurchase: () => void;
  isPurchasing: boolean;
}

function CreditPackCard({ pack, onPurchase, isPurchasing }: CreditPackCardProps) {
  const isPopular = pack.popular;

  return (
    <div
      className={`group relative bg-surface/80 border rounded-sm p-3 xs:p-4 flex flex-col items-center justify-between transition-all duration-300 ${
        isPopular
          ? "border-primary/60 shadow-gold-glow hover:shadow-gold-glow-intense scale-[1.02] z-10"
          : "border-primary/30 shadow-[0px_2px_12px_rgba(212,175,55,0.08)] hover:border-primary/50 hover:shadow-gold-glow hover:-translate-y-1"
      }`}
    >
      {/* PopularRibbon */}
      {isPopular && (
        <div className="absolute -top-3 -right-3 z-20">
          <div className="bg-accent text-white text-[10px] font-header py-1 px-3 shadow-md uppercase tracking-wider relative">
            Most Popular
            <div className="absolute top-full right-0 border-l-[6px] border-t-[6px] border-l-transparent border-t-[#500014]" />
          </div>
        </div>
      )}

      {!isPopular && (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      <div
        className={`w-12 h-12 xs:w-16 xs:h-16 rounded-full bg-void border flex items-center justify-center mb-2 xs:mb-3 transition-transform duration-300 shadow-lg relative overflow-hidden ${
          isPopular
            ? "border-primary group-hover:scale-105 xs:w-20 xs:h-20"
            : "border-primary/30 group-hover:scale-110"
        }`}
      >
        {isPopular && (
          <div className="absolute inset-0 animate-shimmer-sweep opacity-20" />
        )}
        <span
          className={`material-symbols-outlined text-primary ${
            isPopular ? "text-4xl" : "text-3xl"
          }`}
          style={isPopular ? { fontVariationSettings: "'FILL' 1" } : undefined}
          aria-hidden
        >
          {pack.icon}
        </span>
      </div>

      <h3
        className={`font-display italic mb-1 text-center ${
          isPopular ? "text-lg xs:text-2xl text-primary" : "text-base xs:text-xl text-text-main"
        }`}
      >
        {pack.name}
      </h3>
      <p
        className={`font-header mb-3 xs:mb-4 tracking-widest ${
          isPopular ? "text-white text-sm xs:text-base font-bold" : "text-primary text-xs xs:text-sm"
        }`}
      >
        {pack.credits} CREDITS
      </p>

      <button
        type="button"
        onClick={onPurchase}
        disabled={isPurchasing}
        className={`w-full py-2 font-ui text-sm uppercase tracking-wide transition-all duration-300 relative overflow-hidden ${
          isPopular
            ? "py-3 bg-primary text-void font-header font-bold shadow-gold-glow hover:bg-white"
            : "border border-primary/40 text-primary hover:bg-primary hover:text-void"
        }`}
      >
        <span className="relative z-10">
          {isPurchasing ? "Processing…" : pack.price}
        </span>
        {isPopular && (
          <div className="absolute inset-0 animate-shimmer-sweep opacity-30" />
        )}
      </button>
    </div>
  );
}
