import { notFound } from "next/navigation";
import { getCurrentSession } from "@/app/actions/auth";
import { isNovelBookmarked } from "@/app/actions/bookmarks";
import { getReadingProgressForChapter } from "@/app/actions/reading-progress";
import {
  getChapter,
  getChapters,
  getNovel,
} from "@/lib/content";
import { ReadingRoomClient } from "@/app/_components/reading-room/reading-room-client";

/**
 * The Reading Room — distraction-free chapter reading (Req 3.1-3.10, 15.4).
 * No NavigationBar; HUD toggles on tap; font settings persist in localStorage.
 */
export default async function ReadingRoomPage({
  params,
}: {
  params: Promise<{ novelId: string; chapterId: string }>;
}) {
  const { novelId, chapterId } = await params;

  const [chapter, novel, chapters, session] = await Promise.all([
    getChapter(chapterId),
    getNovel(novelId),
    getChapters(novelId),
    getCurrentSession(),
  ]);

  const initialScrollPercent =
    session ? (await getReadingProgressForChapter(chapterId)) ?? 0 : 0;

  if (!chapter || !novel) notFound();
  if (chapter.novelId !== novelId) notFound();

  const chapterIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1]
      : null;

  const bookmarked = session ? await isNovelBookmarked(novelId) : false;

  return (
    <ReadingRoomClient
      novelId={novelId}
      novelTitle={novel.title}
      chapterId={chapterId}
      chapterNumber={chapter.chapterNumber}
      chapterTitle={chapter.title}
      content={chapter.content}
      prevChapterId={prevChapter?.id ?? null}
      nextChapterId={nextChapter?.id ?? null}
      isAuthenticated={!!session}
      initialBookmarked={bookmarked}
      initialScrollPercent={initialScrollPercent}
    />
  );
}
