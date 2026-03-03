import Link from "next/link";

/**
 * Themed 404 page: void background, gold accents, Cinzel/Playfair typography.
 * Message: "This page has slipped into the shadows" with link to Boudoir.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
      <div
        className="pt-safe-top pb-safe-bottom"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <p className="font-header text-sm tracking-[0.2em] text-primary uppercase mb-4">
          Lost in the stacks
        </p>
        <h1 className="font-display italic font-bold text-3xl md:text-4xl text-text-main mb-4 gold-text-shadow">
          This page has slipped into the shadows
        </h1>
        <p className="font-ui text-text-muted text-sm mb-8 max-w-sm">
          The volume you seek is not on our shelf. Return to the Boudoir to find your next read.
        </p>
        <Link
          href="/"
          className="btn-gold inline-block"
          aria-label="Return to home"
        >
          Return to the Boudoir
        </Link>
      </div>
    </div>
  );
}
