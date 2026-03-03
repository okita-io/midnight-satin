import { NavigationBar } from "../_components/navigation-bar";
import { NovelCard } from "../_components/novel-card";
import { EmptyState } from "../_components/empty-state";
import { getAllNovels } from "@/lib/content";

export const revalidate = 60;

export default async function LibraryPage() {
  let novels: Awaited<ReturnType<typeof getAllNovels>> = [];
  try {
    novels = await getAllNovels(100);
  } catch {
    // DB may not be configured
  }

  return (
    <>
      <main style={{ flex: 1, paddingBottom: "6rem", padding: "1.5rem" }}>
        <h1 className="font-header" style={{ fontSize: "1rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem" }}>
          Library
        </h1>
        {novels.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {novels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={{
                  id: novel.id,
                  title: novel.title,
                  authorName: novel.authorName,
                  coverImageUrl: novel.coverImageUrl,
                  rating: novel.rating > 0 ? novel.rating : null,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Your shelf is waiting." />
        )}
      </main>
      <NavigationBar activeTab="library" />
    </>
  );
}
