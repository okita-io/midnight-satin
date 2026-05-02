import { notFound } from "next/navigation";
import { getCurrentSession } from "@/app/actions/auth";
import { isNovelBookmarked } from "@/app/actions/bookmarks";
import {
  getNovel,
  getChapters,
  getCharacters,
  getLatestChapterUpdatedAt,
  getUnlockedChapterIds,
} from "@/lib/content";
import {
  listNovelReviewsPreviewDb,
  getReaderNovelReviewDb,
} from "@/lib/db/novel-reviews";
import { formatUpdatedAgo } from "@/lib/format";
import { readingRoomPath } from "@/lib/navigation";
import { NavigationBar } from "../../_components/navigation-bar";
import { NovelDetailHeader } from "../../_components/novel-detail-header";
import { ParallaxHero } from "../../_components/parallax-hero";
import { SynopsisSection } from "../../_components/synopsis-section";
import { PlayersSection } from "../../_components/players-section";
import { ChapterList } from "../../_components/chapter-list";
import { ReviewsSection } from "../../_components/reviews-section";

export const revalidate = 60;

export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ novelId: string }>;
}) {
  const { novelId } = await params;

  const [novel, chapters, characters, latestUpdated, session, reviewPreview] =
    await Promise.all([
      getNovel(novelId),
      getChapters(novelId),
      getCharacters(novelId),
      getLatestChapterUpdatedAt(novelId),
      getCurrentSession(),
      listNovelReviewsPreviewDb(novelId, 5),
    ]);

  if (!novel) notFound();

  let unlockedIds = new Set<string>();
  let bookmarked = false;
  let myReview: { id: string; content: string } | null = null;

  if (session) {
    const [u, b, r] = await Promise.all([
      getUnlockedChapterIds(session.readerId, novelId),
      isNovelBookmarked(novelId),
      getReaderNovelReviewDb(novelId, session.readerId),
    ]);
    unlockedIds = u;
    bookmarked = b;
    myReview = r ? { id: r.id, content: r.content } : null;
  }

  const firstChapterId = chapters[0]?.id ?? "";
  const updatedAgo = formatUpdatedAgo(latestUpdated);

  return (
    <>
      <NovelDetailHeader
        novelId={novelId}
        novelTitle={novel.title}
        initialBookmarked={bookmarked}
        isAuthenticated={!!session}
      />

      <main className="relative min-h-screen flex flex-col pb-24">
        {/* Mobile: full-bleed parallax hero */}
        <div className="md:hidden">
          <ParallaxHero
            novelId={novelId}
            title={novel.title}
            authorId={novel.authorId}
            authorName={novel.authorName}
            coverImageUrl={novel.coverImageUrl}
            genreTags={novel.genreTags}
            rating={novel.rating}
            ratingCount={novel.ratingCount}
            startReadingHref={
              firstChapterId
                ? readingRoomPath(novelId, firstChapterId)
                : undefined
            }
          />
        </div>

        {/* Mobile: stacked content below hero */}
        <div className="md:hidden relative z-10 px-6 -mt-4 bg-void">
          <SynopsisSection synopsis={novel.synopsis} />
          <PlayersSection
            characters={characters}
            novelId={novelId}
            isAuthenticated={!!session}
          />
          <ReviewsSection
            novelId={novelId}
            isAuthenticated={!!session}
            preview={reviewPreview}
            myReview={myReview}
          />
          <ChapterList
            novelId={novelId}
            chapters={chapters}
            unlockedIds={unlockedIds}
            updatedAgo={updatedAgo}
          />
        </div>

        {/* Tablet/Desktop: two-column layout */}
        <div className="hidden md:flex md:flex-col flex-1 min-h-0 px-6 sm:px-8 pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 md:gap-10 lg:gap-12 flex-1 min-h-0">
            {/* Left column: cover card + players */}
            <div className="flex flex-col gap-8 md:gap-10">
              <ParallaxHero
                novelId={novelId}
                title={novel.title}
                authorId={novel.authorId}
                authorName={novel.authorName}
                coverImageUrl={novel.coverImageUrl}
                genreTags={novel.genreTags}
                rating={novel.rating}
                ratingCount={novel.ratingCount}
                startReadingHref={
                  firstChapterId
                    ? readingRoomPath(novelId, firstChapterId)
                    : undefined
                }
                tabletGridCells
              />
              <PlayersSection
                characters={characters}
                novelId={novelId}
                isAuthenticated={!!session}
              />
              <ReviewsSection
                novelId={novelId}
                isAuthenticated={!!session}
                preview={reviewPreview}
                myReview={myReview}
              />
            </div>

            {/* Right column: synopsis + scrollable contents */}
            <div className="flex flex-col gap-8 md:gap-10 md:min-h-0">
              <SynopsisSection synopsis={novel.synopsis} showHeading />
              <ChapterList
                novelId={novelId}
                chapters={chapters}
                unlockedIds={unlockedIds}
                updatedAgo={updatedAgo}
              />
            </div>
          </div>
        </div>
      </main>

      <NavigationBar activeTab="boudoir" />

      {/* Background texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
