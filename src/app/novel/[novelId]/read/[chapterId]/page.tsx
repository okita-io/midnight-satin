import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSession } from "@/app/actions/auth";
import { isNovelBookmarked } from "@/app/actions/bookmarks";
import { isChapterUnlocked } from "@/app/actions/unlock-chapter";
import { getReadingProgressForChapter } from "@/app/actions/reading-progress";
import { getChapterCommentCount } from "@/app/actions/comments";
import {
  getChapter,
  getChapters,
  getNovel,
} from "@/lib/content";
import { getCurrentReader } from "@/app/actions/auth";
import { ReadingRoomClient } from "@/app/_components/reading-room/reading-room-client";
import { sitePageMetadata } from "@/lib/site-metadata";

/**
 * The Reading Room — distraction-free chapter reading (Req 3.1-3.10, 15.4).
 * The Veil paywall for locked chapters (Req 4.1-4.6).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ novelId: string; chapterId: string }>;
}): Promise<Metadata> {
  const { novelId, chapterId } = await params;
  if (!novelId?.trim() || !chapterId?.trim()) {
    return sitePageMetadata("Reading");
  }
  const [chapter, novel] = await Promise.all([
    getChapter(chapterId),
    getNovel(novelId),
  ]);
  if (!chapter || !novel || chapter.novelId !== novelId) {
    return sitePageMetadata("Reading");
  }
  return sitePageMetadata(
    `${chapter.title} — ${novel.title}`,
    `Read ${chapter.title} of ${novel.title} in the Midnight Satin reading room.`
  );
}

export default async function ReadingRoomPage({
  params,
}: {
  params: Promise<{ novelId: string; chapterId: string }>;
}) {
  const { novelId, chapterId } = await params;

  const [chapter, novel, chapters, session, commentCount] = await Promise.all([
    getChapter(chapterId),
    getNovel(novelId),
    getChapters(novelId),
    getCurrentSession(),
    getChapterCommentCount(chapterId),
  ]);

  if (!chapter || !novel) notFound();
  if (chapter.novelId !== novelId) notFound();

  const initialScrollPercent =
    session ? (await getReadingProgressForChapter(chapterId)) ?? 0 : 0;

  const chapterIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1]
      : null;

  const bookmarked = session ? await isNovelBookmarked(novelId) : false;

  const isUnlocked =
    chapter.isFree ||
    (session ? await isChapterUnlocked(session.readerId, chapterId) : false);

  const reader = session ? await getCurrentReader() : null;
  const creditBalance = reader?.creditBalance ?? 0;

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
      isFree={chapter.isFree}
      isUnlocked={isUnlocked}
      initialCreditBalance={creditBalance}
      initialCommentCount={commentCount}
    />
  );
}
