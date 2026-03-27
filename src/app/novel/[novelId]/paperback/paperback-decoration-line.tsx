/**
 * Ornamental divider — matches The Vault diamond line, themed for paperbacks.
 */

export function PaperbackDecorationLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex w-full max-w-xs mx-auto items-center justify-center gap-4 opacity-40 ${className}`}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <span
        className="material-symbols-outlined text-primary text-[16px] shrink-0"
        aria-hidden
      >
        menu_book
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  );
}
