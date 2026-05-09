import { getNewsArchive } from "@/lib/content";
import { NavigationBar } from "@/app/_components/navigation-bar";
import { NewsArchiveClient } from "./news-archive-client";

export const revalidate = 60;

export default async function UpdatesArchivePage() {
  const { articles, nextCursor } = await getNewsArchive(undefined, 12);
  const archiveBootstrapKey = `${nextCursor ?? ""}\0${articles.map((a) => a.id).join(",")}`;

  return (
    <>
      <main className="min-h-screen bg-void pb-28">
        {/* Page header */}
        <div className="pt-12 pb-8 px-6 text-center">
          <h1 className="font-header text-2xl md:text-3xl tracking-[0.2em] uppercase text-primary gold-text-shadow">
            The Gazette
          </h1>
        </div>

        {/* Articles grid + Load More */}
        <div className="responsive-container px-4 md:px-6">
          <NewsArchiveClient
            key={archiveBootstrapKey}
            initialArticles={articles}
            initialCursor={nextCursor}
          />
        </div>
      </main>

      <NavigationBar activeTab="updates" />
    </>
  );
}
