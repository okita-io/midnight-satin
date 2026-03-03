"use client";

/**
 * Circular character portrait, 80px diameter, gold border.
 * Used in Novel Detail "The Players" and Cast Gallery.
 */
interface CharacterPortraitProps {
  name: string;
  portraitUrl: string | null;
  /** Optional: onClick for opening Cast Gallery (e.g. from Novel Detail) */
  onClick?: () => void;
  /** Optional: render as button for accessibility when onClick provided */
  asButton?: boolean;
  className?: string;
}

export function CharacterPortrait({
  name,
  portraitUrl,
  onClick,
  asButton = false,
  className = "",
}: CharacterPortraitProps) {
  const size = "w-20 h-20";
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

  const wrapperClass = `flex flex-col items-center gap-3 min-w-[80px] snap-center cursor-pointer group ${className}`;

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
