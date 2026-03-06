import { getAllNovels } from "@/lib/content";
import { NavigationBar } from "../_components/navigation-bar";
import { LibraryClient } from "../_components/library-client";

export const revalidate = 60; // ISR: 60s revalidation per design doc

export default async function LibraryPage() {
  let novels: Awaited<ReturnType<typeof getAllNovels>> = [];
  try {
    novels = await getAllNovels(100);
  } catch {
    // DB may not be configured; show empty state
  }

  const catalogNovels = novels.map((n) => ({
    id: n.id,
    title: n.title,
    authorName: n.authorName,
    coverImageUrl: n.coverImageUrl,
    rating: n.rating > 0 ? n.rating : null,
    ratingCount: n.ratingCount,
    authorBio: n.authorBio ?? undefined,
    genreTags: n.genreTags,
    chapterCount: n.chapterCount,
  }));

  return (
    <div className="relative flex min-h-screen flex-col">
      <LibraryClient novels={catalogNovels} />
      <NavigationBar activeTab="library" />
    </div>
  );
}
