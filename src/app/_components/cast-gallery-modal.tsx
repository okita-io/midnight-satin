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
    <div className="absolute top-4 left-4 z-20 animate-trophy-pulse flex flex-col items-center gap-1">
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

/** Endorse button - compact rose icon, pinned on portrait hero (Req 6.1, 6.2, 6.4). */
function EndorseRoseButton({
  characterId,
  endorsementCount,
  onEndorse,
  onAuthPrompt,
}: {
  characterId: string;
  endorsementCount: number;
  onEndorse?: (characterId: string) => void;
  onAuthPrompt?: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [justEndorsed, setJustEndorsed] = useState(false);

  const handleConfirm = () => {
    onEndorse?.(characterId);
    setShowConfirm(false);
    setJustEndorsed(true);
    setTimeout(() => setJustEndorsed(false), 600);
  };

  const handleRoseClick = () => {
    if (onAuthPrompt) {
      onAuthPrompt();
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="relative">
      {showConfirm && (
        <div className="absolute -top-2 right-0 -translate-y-full bg-surface border border-primary/30 text-primary px-4 py-2 rounded shadow-lg text-xs font-ui tracking-wide flex flex-col gap-2 w-max max-w-[260px]">
          <span>Send a Rose? (1 Credit)</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1 bg-primary text-void rounded text-xs font-ui cursor-pointer active:scale-95"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 border border-white/30 rounded text-xs font-ui cursor-pointer active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleRoseClick}
        className="group relative inline-flex items-center gap-2 rounded-full bg-accent/90 hover:bg-accent text-white shadow-[0_4px_20px_rgba(128,0,32,0.35)] hover:shadow-[0_4px_30px_rgba(128,0,32,0.55)] transition-all duration-300 border border-white/10 overflow-hidden cursor-pointer active:scale-95 pl-3 pr-3 py-2 backdrop-blur"
        aria-label="Send endorsement (1 Credit)"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span
          className={`material-symbols-outlined text-[18px] ${
            justEndorsed ? "animate-rose-pulse" : ""
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          local_florist
        </span>
        <span className="font-ui text-[10px] tracking-[0.22em] uppercase">
          Endorse
        </span>
        <span className="ml-1 rounded-full bg-void/35 px-2 py-0.5 text-[10px] font-display font-bold text-primary">
          {endorsementCount.toLocaleString()}
        </span>
      </button>
    </div>
  );
}

/** Character card front - portrait hero top, text content below center, endorsement inline. */
function CharacterCard({
  char,
  onTapReveal,
  onEndorse,
  onAuthPrompt,
}: {
  char: NovelCharacter;
  onTapReveal: () => void;
  onEndorse?: (characterId: string) => void;
  onAuthPrompt?: () => void;
}) {
  return (
    <div className="absolute inset-0 w-full h-full backface-hidden bg-surface rounded-lg overflow-hidden border border-white/5 cursor-pointer flex flex-col">
      {/* Portrait hero — fills top ~55% of card */}
      <div className="relative w-full flex-[0_0_55%] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat gold-sheen-overlay"
          style={{
            backgroundImage: char.portraitUrl ? `url(${char.portraitUrl})` : undefined,
            backgroundColor: char.portraitUrl ? "transparent" : "var(--surface)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
        {char.hasTrophy && <TrophyBadge />}
        <div className="absolute top-4 right-4 z-30">
          <EndorseRoseButton
            characterId={char.id}
            endorsementCount={char.endorsementCount}
            onEndorse={onEndorse}
            onAuthPrompt={onAuthPrompt}
          />
        </div>
      </div>

      {/* Text content below portrait — flows naturally, no overlap */}
      <div className="flex-1 flex flex-col items-center text-center px-6 py-5 bg-gradient-to-b from-void to-surface">
        {char.roleSubtitle && (
          <div className="mb-1.5 flex items-center gap-2 opacity-80">
            <div className="h-[1px] w-8 bg-primary/50" />
            <span className="font-ui text-primary text-xs tracking-[0.2em] uppercase">
              {char.roleSubtitle}
            </span>
            <div className="h-[1px] w-8 bg-primary/50" />
          </div>
        )}
        <h2 className="font-display text-3xl md:text-4xl italic text-white mb-3 drop-shadow-lg">
          {char.name}
        </h2>
        {char.description && (
          <p className="font-body text-sm italic text-text-main/60 leading-relaxed mb-4 max-w-[90%] line-clamp-3">
            {char.description}
          </p>
        )}

        <button
          type="button"
          onClick={onTapReveal}
          className="mt-auto flex items-center gap-2 text-white/40 hover:text-primary text-xs font-ui tracking-widest uppercase transition-colors cursor-pointer active:scale-95 pb-2"
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
        <div className="flex items-center gap-3">
          <h3 className="font-header text-primary text-lg tracking-widest">
            Confidential
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-void/60 border border-primary/20 px-2.5 py-1">
            <span
              className="material-symbols-outlined text-primary text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_florist
            </span>
            <span className="font-ui text-[10px] tracking-[0.2em] uppercase text-text-main/70">
              Rank
            </span>
            <span className="font-display text-[11px] font-bold text-primary">
              {char.endorsementCount.toLocaleString()}
            </span>
          </span>
        </div>
        <span className="text-white/20 font-mono text-xs">
          REF: {char.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Stats grid - Age, Status, Height, Occupation, Zodiac, Blood Type, Birthday */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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
                  {stats.favorites!.map((f) => (
                    <li key={`fav:${f}`}>{f}</li>
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
                  {stats.dislikes!.map((d) => (
                    <li key={`dis:${d}`}>{d}</li>
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
        <div className="mb-6">
          <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">
            Background
          </p>
          <p className="font-body text-sm leading-relaxed text-text-muted">
            {char.backstory}
          </p>
        </div>
      )}

      <div className="mt-auto pt-4 pb-2 flex justify-center shrink-0">
        <button
          type="button"
          onClick={onTapReturn}
          className="flex items-center gap-2 text-white/30 hover:text-primary text-xs font-ui tracking-widest uppercase transition-colors cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">undo</span>
          <span>Return to portrait</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Single character card for grid layout - flip interaction, taller portrait ratio.
 * Endorsement is inline within the card front, no overlap.
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
    <div className="group/card relative w-full aspect-[2/3] min-h-[420px] perspective-1000">
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out shadow-gold-glow rounded-lg ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <CharacterCard
          char={char}
          onTapReveal={() => setFlipped(true)}
          onEndorse={onEndorse}
          onAuthPrompt={onAuthPrompt}
        />
        <DossierCard char={char} onTapReturn={() => setFlipped(false)} />
      </div>
    </div>
  );
}

/** Navigation arrows - left/right, visible on all screen sizes. */
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
        className="absolute left-2 top-1/2 -translate-y-1/2 z-40 flex size-10 md:size-12 items-center justify-center rounded-full bg-surface/40 backdrop-blur-sm border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all duration-300 cursor-pointer active:scale-95"
        aria-label="Previous character"
      >
        <span className="material-symbols-outlined text-2xl md:text-4xl">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-40 flex size-10 md:size-12 items-center justify-center rounded-full bg-surface/40 backdrop-blur-sm border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all duration-300 cursor-pointer active:scale-95"
        aria-label="Next character"
      >
        <span className="material-symbols-outlined text-2xl md:text-4xl">chevron_right</span>
      </button>
    </>
  );
}

/**
 * Cast Gallery modal - full-screen character viewer with CharacterCard, DossierCard,
 * TrophyBadge, EndorseRoseButton, and NavigationArrows.
 * Matches reference/the_cast_gallery_1.html and the_cast_gallery_2.html.
 */
export function CastGalleryModal({
  characters,
  initialIndex = 0,
  onClose,
  onEndorse,
  onAuthPrompt,
}: CastGalleryModalProps) {
  const [index, setIndex] = useState(() =>
    Math.min(initialIndex, Math.max(0, characters.length - 1))
  );
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

  const keyDownHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyDownHandlerRef.current = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (flipped) setFlipped(false);
      else onClose();
    }
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => keyDownHandlerRef.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
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
      className="fixed inset-0 z-[100] bg-void text-text-main w-full flex flex-col items-center justify-center md:justify-start font-body selection:bg-primary selection:text-void overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Cast Gallery"
    >
      {/* Fixed header: back arrow | centered title | close button */}
      <div className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-between items-center bg-gradient-to-b from-void/90 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex items-center justify-center size-10 rounded-full bg-surface/50 backdrop-blur-md border border-white/10 text-text-main hover:bg-surface/70 transition-colors cursor-pointer active:scale-95"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
        <span className="text-primary font-header text-xs tracking-[0.2em] uppercase pointer-events-none">
          Cast Gallery
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="pointer-events-auto group flex items-center justify-center size-10 rounded-full bg-surface/50 border border-white/10 backdrop-blur-md text-text-main hover:bg-primary hover:text-void hover:border-primary transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Close Cast Gallery"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      </div>

      {/* Main content area */}
      <main className="relative w-full mx-auto flex flex-col items-center p-4 pt-24 pb-32">
        {/* Mobile: single card view */}
        <div className="md:hidden relative w-full max-w-md mx-auto flex flex-col items-center">
          <NavigationArrows onPrev={goPrev} onNext={goNext} />

          <div className="group/card w-full perspective-1000 relative h-[600px]">
            <div
              className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out shadow-gold-glow rounded-lg ${
                flipped ? "rotate-y-180" : ""
              }`}
            >
              <CharacterCard
                char={char}
                onTapReveal={() => setFlipped(true)}
                onEndorse={onEndorse}
                onAuthPrompt={onAuthPrompt}
              />
              <DossierCard char={char} onTapReturn={() => setFlipped(false)} />
            </div>
          </div>

          {characters.length > 1 && (
            <div className="flex gap-2 mt-6">
              {characters.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setFlipped(false);
                  }}
                  className={`size-2 rounded-full transition-colors cursor-pointer active:scale-125 ${
                    i === index ? "bg-primary" : "bg-white/30"
                  }`}
                  aria-label={`Go to character ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tablet/Desktop: 2-col tablet, 3-col desktop grid */}
        <div className="hidden md:block w-full max-w-6xl mx-auto px-8 lg:px-12 pt-0 pb-12">
          <div className="grid grid-cols-2 grid-rows-3 gap-8 lg:grid-cols-3 lg:gap-10">
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
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] mix-blend-overlay" />
    </div>
  );
}
