import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/app/actions/auth";
import { getNovel } from "@/lib/content";
import { getNovelWordCount } from "@/lib/paperback/word-count";
import { calculatePaperbackPrice } from "@/lib/paperback/pricing";
import { PaperbackClient } from "./paperback-client";

export default async function PaperbackPurchasePage({
  params,
}: {
  params: Promise<{ novelId: string }>;
}) {
  const { novelId } = await params;

  const novel = await getNovel(novelId);
  if (!novel) notFound();

  const [wordCount, session] = await Promise.all([
    getNovelWordCount(novelId),
    getCurrentSession(),
  ]);

  const priceCents = calculatePaperbackPrice(wordCount);
  const isPaperbackEnabled =
    process.env.NEXT_PUBLIC_PAPERBACK_ENABLED === "true";

  if (!isPaperbackEnabled) {
    // Coming Soon state
    return (
      <>
        {/* Fixed header with back arrow — matches Novel Detail Header styling */}
        <div
          className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent w-full pointer-events-none"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
        >
          <Link
            href={`/novel/${novelId}`}
            className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-shadow-sm">
              arrow_back
            </span>
          </Link>
        </div>

        <main className="min-h-screen bg-void text-white flex flex-col items-center justify-center px-6 py-24">
          {/* Surface card container */}
          <div className="w-full max-w-md bg-surface border border-white/5 rounded-sm p-8 flex flex-col items-center gap-6 shadow-card-depth">
            {/* Novel cover */}
            {novel.coverImageUrl && (
              <img
                src={novel.coverImageUrl}
                alt={novel.title}
                className="w-48 h-auto rounded-sm shadow-lg border border-white/5"
              />
            )}

            {/* Title & author */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-playfair italic font-bold text-2xl text-white gold-text-shadow">
                {novel.title}
              </h1>
              <p className="font-marcellus text-white/60 text-sm tracking-wide">
                by {novel.authorName}
              </p>
            </div>

            {/* Divider */}
            <div className="w-16 h-px bg-primary/30" />

            {/* Coming Soon heading */}
            <h2 className="font-cinzel uppercase text-primary text-xl tracking-widest">
              Coming Soon
            </h2>

            {/* Personalized body message */}
            <p className="font-literata text-white/70 text-center leading-relaxed text-sm">
              Love doesn&apos;t have to stay behind a screen. Get a
              high-quality, physical edition of{" "}
              <span className="italic text-white">{novel.title}</span> to keep
              forever.
            </p>

            {/* Coming soon note */}
            <p className="font-literata text-white/40 text-xs text-center">
              Paperback ordering is coming soon. Stay tuned!
            </p>

            {/* Back to Novel button */}
            <Link
              href={`/novel/${novelId}`}
              className="btn-gold inline-block mt-2"
            >
              Back to Novel
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Active state — renders PaperbackClient component
  return (
    <>
      {/* Fixed header with back arrow — same as Coming Soon state */}
      <div
        className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent w-full pointer-events-none"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        <Link
          href={`/novel/${novelId}`}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-shadow-sm">
            arrow_back
          </span>
        </Link>
      </div>

      <main className="min-h-screen bg-void text-white flex flex-col items-center justify-center px-6 py-24">
        <PaperbackClient
          novelId={novelId}
          novelTitle={novel.title}
          authorName={novel.authorName}
          coverImageUrl={novel.coverImageUrl}
          priceCents={priceCents}
          wordCount={wordCount}
          isAuthenticated={!!session}
        />
      </main>
    </>
  );
}
