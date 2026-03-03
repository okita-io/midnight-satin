import { notFound } from "next/navigation";
import { getCurrentSession } from "@/app/actions/auth";
import { isNovelBookmarked } from "@/app/actions/bookmarks";
import {
  getNovel,
  getChapters,
  getCharacters,
  getLatestChapterUpdatedAt,
  getUnlockedChapterIds,
  getReadingProgressForNovel,
  getFirstUnreadChapterId,
} from "@/lib/content";
import { formatUpdatedAgo } from "@/lib/format";
import { NavigationBar } from "../../_components/navigation-bar";
import { NovelDetailHeader } from "../../_components/novel-detail-header";
import { ParallaxHero } from "../../_components/parallax-hero";
import { SynopsisSection } from "../../_components/synopsis-section";
import { PlayersSection } from "../../_components/players-section";
import { ChapterList } from "../../_components/chapter-list";
import { FloatingActionButton } from "../../_components/floating-action-button";

export const revalidate = 60;

export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ novelId: string }>;
}) {
  const { novelId } = await params;

  const [novel, chapters, characters, latestUpdated, session] = await Promise.all([
    getNovel(novelId),
    getChapters(novelId),
    getCharacters(novelId),
    getLatestChapterUpdatedAt(novelId),
    getCurrentSession(),
  ]);

  if (!novel) notFound();

  let unlockedIds = new Set<string>();
  let progress = new Map<string, number>();
  let bookmarked = false;

  if (session) {
    [unlockedIds, progress, bookmarked] = await Promise.all([
      getUnlockedChapterIds(session.readerId, novelId),
      getReadingProgressForNovel(session.readerId, novelId),
      isNovelBookmarked(novelId),
    ]);
  }

  const firstUnreadChapterId = getFirstUnreadChapterId(chapters, progress);
  const firstChapterId = chapters[0]?.id ?? "";
  const fabChapterId = firstUnreadChapterId || firstChapterId;
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
        <ParallaxHero
          title={novel.title}
          authorId={novel.authorId}
          authorName={novel.authorName}
          coverImageUrl={novel.coverImageUrl}
          genreTags={novel.genreTags}
          rating={novel.rating}
          ratingCount={novel.ratingCount}
        />

        <div className="relative z-10 px-6 -mt-4 bg-void">
          <SynopsisSection synopsis={novel.synopsis} />
          <PlayersSection characters={characters} />
          <ChapterList
            novelId={novelId}
            chapters={chapters}
            unlockedIds={unlockedIds}
            updatedAgo={updatedAgo}
          />
        </div>

        {fabChapterId && (
          <FloatingActionButton novelId={novelId} chapterId={fabChapterId} />
        )}
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
