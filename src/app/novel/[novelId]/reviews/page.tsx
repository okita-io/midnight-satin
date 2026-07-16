import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui";
import { getCurrentSession } from "@/app/actions/auth";
import { isNovelBookmarked } from "@/app/actions/bookmarks";
import { getNovel } from "@/lib/content";
import {
  listNovelReviewsAllDb,
  getReaderNovelReviewDb,
} from "@/lib/db/novel-reviews";
import { NavigationBar } from "@/app/_components/navigation-bar";
import { NovelDetailHeader } from "@/app/_components/novel-detail-header";
import { ReviewCard } from "@/app/_components/review-card";
import { NovelReviewComposer } from "@/app/_components/novel-review-composer";
import { sitePageMetadata } from "@/lib/site-metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ novelId: string }>;
}): Promise<Metadata> {
  const { novelId } = await params;
  const novel = await getNovel(novelId);
  if (!novel) return sitePageMetadata("Reviews");
  return sitePageMetadata(
    `Reviews — ${novel.title}`,
    `Reader reviews and ratings for ${novel.title} by ${novel.authorName}.`
  );
}

export default async function NovelReviewsPage({
  params,
}: {
  params: Promise<{ novelId: string }>;
}) {
  const { novelId } = await params;

  const [novel, session, allReviews] = await Promise.all([
    getNovel(novelId),
    getCurrentSession(),
    listNovelReviewsAllDb(novelId, 100),
  ]);

  if (!novel) notFound();

  let bookmarked = false;
  let myReview: { id: string; content: string; starRating: number } | null = null;
  if (session) {
    [bookmarked, myReview] = await Promise.all([
      isNovelBookmarked(novelId),
      getReaderNovelReviewDb(novelId, session.readerId).then((r) =>
        r ? { id: r.id, content: r.content, starRating: r.starRating } : null
      ),
    ]);
  }

  const returnPath = `/novel/${novelId}/reviews`;

  return (
    <>
      <NovelDetailHeader
        key={novelId}
        novelId={novelId}
        novelTitle={novel.title}
        initialBookmarked={bookmarked}
        isAuthenticated={!!session}
      />

      <main className="relative min-h-screen flex flex-col pb-28 px-6 pt-2">
        <nav className="mb-4" aria-label="Breadcrumb">
          <BackLink
            href={`/novel/${novelId}`}
            label="Back to novel"
            iconSize="md"
            className="text-xs text-primary/70 hover:text-primary uppercase tracking-wider"
          />
        </nav>

        <header className="mb-8 border-b border-primary/20 pb-4">
          <h1 className="font-display italic text-2xl xs:text-3xl text-primary mb-1">
            Reviews
          </h1>
          <p className="text-text-muted text-sm font-body">{novel.title}</p>
          <p className="text-[10px] text-text-muted/70 font-ui uppercase tracking-widest mt-2">
            Most helpful first, then newest
          </p>
        </header>

        <div className="flex flex-col gap-4 max-w-2xl w-full mx-auto">
          {allReviews.length === 0 ? (
            <p className="text-sm text-text-muted font-body">
              No reviews yet. Be the first to share your thoughts.
            </p>
          ) : (
            allReviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={{
                  id: r.id,
                  content: r.content,
                  likeCount: r.likeCount,
                  starRating: r.starRating,
                  createdAt: r.createdAt,
                  readerDisplayName: r.readerDisplayName,
                }}
                variant="full"
              />
            ))
          )}
        </div>

        <div className="max-w-2xl w-full mx-auto mt-10 border-t border-primary/10 pt-8">
          <NovelReviewComposer
            novelId={novelId}
            isAuthenticated={!!session}
            returnPath={returnPath}
            myReview={myReview}
          />
        </div>
      </main>

      <NavigationBar activeTab="boudoir" />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
