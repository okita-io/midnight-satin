import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/app/actions/auth";
import { getNovel } from "@/lib/content";
import { getNovelWordCount } from "@/lib/paperback/word-count";
import { calculatePaperbackPrice } from "@/lib/paperback/pricing";
import { PaperbackClient } from "./paperback-client";
import { PaperbackPageShell } from "./paperback-page-shell";

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
  const purchaseEnabled =
    process.env.NEXT_PUBLIC_PAPERBACK_PURCHASE_ENABLED === "true";

  if (!isPaperbackEnabled) {
    return (
      <PaperbackPageShell novelId={novelId}>
        <div className="card w-full p-6 xs:p-8 flex flex-col items-center gap-6">
          <div className="overlay-sheen" aria-hidden />
          {novel.coverImageUrl && (
            <img
              src={novel.coverImageUrl}
              alt={novel.title}
              className="relative z-10 w-48 h-auto rounded-sm shadow-lg border border-white/10"
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <h2 className="font-playfair italic font-bold text-2xl text-white gold-text-shadow">
              {novel.title}
            </h2>
            <p className="font-marcellus text-white/60 text-sm tracking-wide">
              by {novel.authorName}
            </p>
          </div>

          <div className="relative z-10 w-16 h-px bg-primary/30" />

          <h3 className="relative z-10 font-cinzel uppercase text-primary text-xl tracking-widest text-center">
            Coming Soon
          </h3>

          <p className="relative z-10 font-literata text-white/70 text-center leading-relaxed text-sm">
            Love doesn&apos;t have to stay behind a screen. Get a high-quality,
            physical edition of{" "}
            <span className="italic text-white">{novel.title}</span> to keep
            forever.
          </p>

          <p className="relative z-10 font-literata text-white/40 text-xs text-center">
            Paperback ordering is coming soon. Stay tuned!
          </p>

          <Link
            href={`/novel/${novelId}`}
            className="relative z-10 btn-gold inline-block mt-2"
          >
            Back to Novel
          </Link>
        </div>
      </PaperbackPageShell>
    );
  }

  return (
    <PaperbackPageShell novelId={novelId}>
      <PaperbackClient
        novelId={novelId}
        novelTitle={novel.title}
        authorName={novel.authorName}
        coverImageUrl={novel.coverImageUrl}
        priceCents={priceCents}
        wordCount={wordCount}
        isAuthenticated={!!session}
        purchaseEnabled={purchaseEnabled}
      />
    </PaperbackPageShell>
  );
}
