"use client";

/**
 * Circular character portrait, 80px diameter by default, gold border.
 * Used in Novel Detail "The Players" and Cast Gallery.
 * When responsive=true, uses larger sizes on tablet (112px) and desktop (96px) for cast preview.
 */
interface CharacterPortraitProps {
  name: string;
  portraitUrl: string | null;
  /** Optional: onClick for opening Cast Gallery (e.g. from Novel Detail) */
  onClick?: () => void;
  /** Optional: render as button for accessibility when onClick provided */
  asButton?: boolean;
  /** Optional: use responsive sizes for cast preview (80px mobile, 112px tablet, 96px desktop) */
  responsive?: boolean;
  className?: string;
}

export function CharacterPortrait({
  name,
  portraitUrl,
  onClick,
  asButton = false,
  responsive = false,
  className = "",
}: CharacterPortraitProps) {
  const size = responsive
    ? "w-20 h-20 md:w-[7rem] md:h-[7rem] lg:w-24 lg:h-24"
    : "w-20 h-20";
  const minWidth = responsive
    ? "min-w-[80px] md:min-w-[7rem] lg:min-w-24"
    : "min-w-[80px]";
  const content = (
    <>
      <div
        className={`${size} rounded-full p-[2px] border border-primary/30 group-hover:border-primary group-hover:shadow-gold-glow transition-all duration-300`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-surface relative">
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt=""
              className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-text-muted text-2xl">
              person
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-text-main font-medium tracking-wide">{name}</span>
    </>
  );

  const wrapperClass = `flex flex-col items-center gap-3 ${minWidth} snap-center cursor-pointer group active:scale-95 transition-transform ${className}`;

  if (asButton && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={wrapperClass}
        aria-label={`View character ${name}`}
      >
        {content}
      </button>
    );
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={wrapperClass}
        aria-label={`View character ${name}`}
      >
        {content}
      </div>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
