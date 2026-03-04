"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthPrompt } from "../_components/auth-prompt";

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
}

export function VaultClient({ isAuthenticated }: VaultClientProps) {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  function handlePurchaseClick(packId: string) {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    // Task 12.2 will implement purchaseCredits; for now show loading state
    setPurchasingPackId(packId);
    // Simulate async - in real impl this would call purchaseCredits server action
    setTimeout(() => setPurchasingPackId(null), 1500);
  }

  return (
    <>
      <main className="relative z-10 flex-1 px-4 pb-24 overflow-y-auto">
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

        {/* CreditPackGrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
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
      className={`group relative bg-surface/80 border rounded-sm p-4 flex flex-col items-center justify-between transition-all duration-300 ${
        isPopular
          ? "border-primary/60 shadow-gold-glow hover:shadow-gold-glow-intense scale-[1.02] z-10"
          : "border-primary/20 hover:border-primary/50 hover:shadow-gold-glow hover:-translate-y-1"
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
        className={`w-16 h-16 rounded-full bg-void border flex items-center justify-center mb-3 transition-transform duration-300 shadow-lg relative overflow-hidden ${
          isPopular
            ? "border-primary group-hover:scale-105 w-20 h-20"
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
        className={`font-display italic mb-1 ${
          isPopular ? "text-2xl text-primary" : "text-xl text-text-main"
        }`}
      >
        {pack.name}
      </h3>
      <p
        className={`font-header mb-4 tracking-widest ${
          isPopular ? "text-white text-base font-bold" : "text-primary text-sm"
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
            ? "py-3 bg-primary text-void font-header font-bold shadow-lg hover:bg-white"
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
