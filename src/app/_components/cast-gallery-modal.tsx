"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import type { NovelCharacter } from "@/lib/content";
import type { CharacterStats } from "@/lib/db/types";

interface CastGalleryModalProps {
  characters: NovelCharacter[];
  initialIndex?: number;
  onClose: () => void;
  /** Called when user confirms endorsement (authenticated). */
  onEndorse?: (characterId: string) => void;
  /** Called when guest taps rose (show auth prompt). */
  onAuthPrompt?: () => void;
}

/** Safely extract CharacterStats from NovelCharacter.stats (Record<string, unknown>). */
function getStats(char: NovelCharacter): Partial<CharacterStats> {
  const s = char.stats;
  if (!s || typeof s !== "object") return {};
  return {
    age: typeof s.age === "string" ? s.age : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
    height: typeof s.height === "string" ? s.height : undefined,
    occupation: typeof s.occupation === "string" ? s.occupation : undefined,
    zodiacSign: typeof s.zodiacSign === "string" ? s.zodiacSign : undefined,
    bloodType: typeof s.bloodType === "string" ? s.bloodType : undefined,
    birthday: typeof s.birthday === "string" ? s.birthday : undefined,
    favorites: Array.isArray(s.favorites) ? (s.favorites as string[]) : undefined,
    dislikes: Array.isArray(s.dislikes) ? (s.dislikes as string[]) : undefined,
  };
}

/** Trophy badge - animated pulsing gold glow when endorsements > 1000 (Req 5.5). */
function TrophyBadge() {
  return (
    <div className="absolute top-4 right-4 z-20 animate-trophy-pulse flex flex-col items-center gap-1">
      <div className="size-10 rounded-full bg-surface/80 backdrop-blur border border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]">
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          emoji_events
        </span>
      </div>
      <span className="text-[10px] font-header text-primary tracking-widest uppercase bg-void/80 px-2 py-0.5 rounded-full border border-primary/30">
        Top Pick
      </span>
    </div>
  );
}

/** Character card front - portrait, gradient overlay, name, role, description. */
function CharacterCard({
  char,
  onTapReveal,
}: {
  char: NovelCharacter;
  onTapReveal: () => void;
}) {
  return (
    <div className="absolute inset-0 w-full h-full backface-hidden bg-surface rounded-lg overflow-hidden border border-white/5">
      {/* Portrait background with gold sheen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat gold-sheen-overlay"
        style={{
          backgroundImage: char.portraitUrl ? `url(${char.portraitUrl})` : undefined,
          backgroundColor: char.portraitUrl ? "transparent" : "var(--surface)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />

      {char.hasTrophy && <TrophyBadge />}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-32 bg-gradient-to-t from-void via-void/90 to-transparent flex flex-col items-center text-center">
        {char.description && (
          <p className="font-body text-sm italic text-text-main/60 leading-relaxed mb-6 max-w-[85%]">
            {char.description}
          </p>
        )}
        {char.roleSubtitle && (
          <div className="mb-2 flex items-center gap-2 opacity-80">
            <div className="h-[1px] w-8 bg-primary/50" />
            <span className="font-ui text-primary text-xs tracking-[0.2em] uppercase">
              {char.roleSubtitle}
            </span>
            <div className="h-[1px] w-8 bg-primary/50" />
          </div>
        )}
        <h2 className="font-display text-4xl italic text-white mb-6 drop-shadow-lg">
          {char.name}
        </h2>
        <button
          type="button"
          onClick={onTapReveal}
          className="flex items-center gap-2 text-white/40 hover:text-primary text-xs font-ui tracking-widest uppercase transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">cached</span>
          <span>Tap to reveal dossier</span>
        </button>
      </div>
    </div>
  );
}

/** Dossier card back - stats grid, Tastes & Temptations, secrets, background (Req 5.4, 5.7). */
function DossierCard({
  char,
  onTapReturn,
}: {
  char: NovelCharacter;
  onTapReturn: () => void;
}) {
  const stats = getStats(char);
  const hasFavorites = stats.favorites && stats.favorites.length > 0;
  const hasDislikes = stats.dislikes && stats.dislikes.length > 0;
  const hasTastes = hasFavorites || hasDislikes;

  const statItems = [
    { label: "Age", value: stats.age },
    { label: "Status", value: stats.status },
    { label: "Height", value: stats.height },
    { label: "Occupation", value: stats.occupation },
    { label: "Zodiac Sign", value: stats.zodiacSign },
    { label: "Blood Type", value: stats.bloodType },
    { label: "Birthday", value: stats.birthday },
  ].filter((item) => item.value);

  return (
    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-surface bg-silk-noise rounded-lg border border-primary/20 p-8 flex flex-col shadow-[inset_0_0_20px_rgba(212,175,55,0.1)] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-primary/20 pb-4 mb-6">
        <h3 className="font-header text-primary text-lg tracking-widest">
          Confidential
        </h3>
        <span className="text-white/20 font-mono text-xs">
          REF: {char.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Stats grid - Age, Status, Height, Occupation, Zodiac, Blood Type, Birthday */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {statItems.map(({ label, value }) => (
          <div key={label}>
            <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-body text-text-main text-lg">{value}</p>
          </div>
        ))}
      </div>

      {/* Tastes & Temptations - favorites and dislikes (Req 5.7) */}
      {hasTastes && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-sm">
              favorite
            </span>
            <p className="font-ui text-xs text-primary uppercase tracking-wider">
              Tastes & Temptations
            </p>
          </div>
          <div className="p-4 bg-void/50 border border-white/5 rounded space-y-2">
            {hasFavorites && (
              <div>
                <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Favorites
                </p>
                <ul className="font-body text-sm text-text-main/90 italic list-disc list-inside space-y-0.5">
                  {stats.favorites!.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasDislikes && (
              <div>
                <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Dislikes
                </p>
                <ul className="font-body text-sm text-text-main/90 italic list-disc list-inside space-y-0.5">
                  {stats.dislikes!.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Known Secrets - burgundy accent bar */}
      {char.secrets.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-sm">
              lock
            </span>
            <p className="font-ui text-xs text-primary uppercase tracking-wider">
              Known Secrets
            </p>
          </div>
          <div className="p-4 bg-void/50 border border-white/5 rounded relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <p className="font-body text-sm leading-relaxed text-text-main/90 italic pl-3">
              &quot;{char.secrets[0]}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Background */}
      {char.backstory && (
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">
            Background
          </p>
          <p className="font-body text-sm leading-relaxed text-text-muted line-clamp-6">
            {char.backstory}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        </div>
      )}

      <div className="mt-auto pt-4 flex justify-center">
        <button
          type="button"
          onClick={onTapReturn}
          className="flex items-center gap-2 text-white/30 hover:text-primary text-xs font-ui tracking-widest uppercase transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">undo</span>
          <span>Return to portrait</span>
        </button>
      </div>
    </div>
  );
}

/** Endorsement FAB - 64px burgundy circle, rose icon, endorsement count (Req 6.1, 6.2). */
function EndorsementFAB({
  characterId,
  endorsementCount,
  onEndorse,
  onAuthPrompt,
  compact = false,
}: {
  characterId: string;
  endorsementCount: number;
  onEndorse?: (characterId: string) => void;
  onAuthPrompt?: () => void;
  /** When true, use smaller size for grid cards (THE-64). */
  compact?: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onEndorse?.(characterId);
    setShowConfirm(false);
  };

  const handleRoseClick = () => {
    if (onAuthPrompt) {
      onAuthPrompt();
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 ${
        compact ? "absolute bottom-4 z-50" : "absolute bottom-12 z-50"
      }`}
    >
      {showConfirm && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-surface border border-primary/30 text-primary px-4 py-2 rounded shadow-lg text-xs font-ui tracking-wide flex flex-col gap-2">
          <span>Send a Rose? (1 Credit)</span>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1 bg-primary text-void rounded text-xs font-ui"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 border border-white/30 rounded text-xs font-ui"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleRoseClick}
        className={`relative group flex items-center justify-center rounded-full bg-accent text-white shadow-[0_4px_20px_rgba(128,0,32,0.4)] hover:scale-110 hover:shadow-[0_4px_30px_rgba(128,0,32,0.6)] transition-all duration-300 border border-white/10 overflow-hidden ${
          compact ? "size-12" : "size-16"
        }`}
        aria-label="Send endorsement (1 Credit)"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span
          className={`material-symbols-outlined ${compact ? "text-2xl" : "text-3xl"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          local_florist
        </span>
      </button>
      <div className="flex flex-col items-center">
        <span
          className={`font-display font-bold text-primary drop-shadow-md ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          {endorsementCount.toLocaleString()}
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-ui">
          Endorsements
        </span>
      </div>
    </div>
  );
}

/**
 * Single character card for grid layout - flip interaction, portrait aspect ratio (THE-64).
 * Used in tablet/desktop grid; each card has its own flip state and endorsement FAB.
 */
function CharacterGridCard({
  char,
  onEndorse,
  onAuthPrompt,
}: {
  char: NovelCharacter;
  onEndorse?: (characterId: string) => void;
  onAuthPrompt?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="group/card relative w-full aspect-[3/4] min-h-[280px] perspective-1000">
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out shadow-gold-glow rounded-lg ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <CharacterCard char={char} onTapReveal={() => setFlipped(true)} />
        <DossierCard char={char} onTapReturn={() => setFlipped(false)} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <EndorsementFAB
            characterId={char.id}
            endorsementCount={char.endorsementCount}
            onEndorse={onEndorse}
            onAuthPrompt={onAuthPrompt}
            compact
          />
        </div>
      </div>
    </div>
  );
}

/** Navigation arrows - left/right, visible on tablet/desktop (Req 5.6). */
function NavigationArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex size-12 items-center justify-center rounded-full text-white/30 hover:text-primary transition-colors"
        aria-label="Previous character"
      >
        <span className="material-symbols-outlined text-4xl">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex size-12 items-center justify-center rounded-full text-white/30 hover:text-primary transition-colors"
        aria-label="Next character"
      >
        <span className="material-symbols-outlined text-4xl">chevron_right</span>
      </button>
    </>
  );
}

/**
 * Cast Gallery modal - full-screen character viewer with CharacterCard, DossierCard,
 * TrophyBadge, EndorsementFAB, and NavigationArrows.
 * Matches reference/the_cast_gallery_1.html and the_cast_gallery_2.html.
 */
export function CastGalleryModal({
  characters,
  initialIndex = 0,
  onClose,
  onEndorse,
  onAuthPrompt,
}: CastGalleryModalProps) {
  const safeIndex = Math.min(initialIndex, Math.max(0, characters.length - 1));
  const [index, setIndex] = useState(safeIndex);
  const [flipped, setFlipped] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const char = characters[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : characters.length - 1));
    setFlipped(false);
  }, [characters.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < characters.length - 1 ? i + 1 : 0));
    setFlipped(false);
  }, [characters.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (flipped) setFlipped(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext, flipped]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  if (characters.length === 0 || !char) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center bg-void"
      role="dialog"
      aria-modal="true"
      aria-label="Cast Gallery"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] bg-gradient-to-b from-void/90 to-transparent">
        <span className="font-header text-primary text-xs tracking-[0.2em] uppercase">
          Cast Gallery
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex items-center justify-center size-10 rounded-full bg-surface/50 border border-white/10 backdrop-blur-sm text-text-main hover:bg-primary hover:text-void hover:border-primary transition-all duration-300"
          aria-label="Close Cast Gallery"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      </div>

      {/* Main content: mobile single-card, tablet/desktop grid (THE-64) */}
      <main className="relative w-full flex-1 overflow-y-auto">
        {/* Mobile: single card view (Req 5.1) */}
        <div className="md:hidden relative w-full flex-1 flex flex-col items-center justify-center p-4 pt-20 max-w-md mx-auto">
          <NavigationArrows onPrev={goPrev} onNext={goNext} />

          <div className="group/card w-full h-[75vh] perspective-1000 relative">
            <div
              className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out shadow-gold-glow rounded-lg ${
                flipped ? "rotate-y-180" : ""
              }`}
            >
              <CharacterCard
                char={char}
                onTapReveal={() => setFlipped(true)}
              />
              <DossierCard char={char} onTapReturn={() => setFlipped(false)} />
            </div>
          </div>

          <EndorsementFAB
            characterId={char.id}
            endorsementCount={char.endorsementCount}
            onEndorse={onEndorse}
            onAuthPrompt={onAuthPrompt}
          />

          {characters.length > 1 && (
            <div className="flex gap-2 mt-4">
              {characters.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setFlipped(false);
                  }}
                  className={`size-2 rounded-full transition-colors ${
                    i === index ? "bg-primary" : "bg-white/30"
                  }`}
                  aria-label={`Go to character ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tablet/Desktop: 2-col tablet, 3-col desktop grid, gap 24px/32px (THE-64) */}
        <div className="hidden md:block w-full max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="grid grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {characters.map((c) => (
              <CharacterGridCard
                key={c.id}
                char={c}
                onEndorse={onEndorse}
                onAuthPrompt={onAuthPrompt}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Background texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
