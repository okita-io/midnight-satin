import { getCurrentSession } from "@/app/actions/auth";
import { NavigationBar } from "./_components/navigation-bar";
import { BoudoirHeader } from "./_components/boudoir-header";
import { HeroCarousel } from "./_components/hero-carousel";
import { CurrentAffairsSection } from "./_components/current-affairs-section";
import { HighSocietySection } from "./_components/high-society-section";
import { TheLatestSection } from "./_components/the-latest-section";
import { VaultTeaserCard } from "./_components/vault-teaser-card";
import {
  getFeaturedNovels,
  getTrendingNovels,
  getCurrentReading,
  getFeaturedNewsArticles,
  getLatestNewsArticles,
} from "@/lib/content";
import type { NewsArticleSummary } from "@/lib/db/types";

export const metadata = {
  title: "The Boudoir | Midnight Satin",
  description:
    "Your private library of romance—featured novels, trending reads, and the latest from Midnight Satin.",
};

export const revalidate = 60; // ISR: 60s revalidation per design doc

export default async function BoudoirPage() {
  let featured: Awaited<ReturnType<typeof getFeaturedNovels>> = [];
  let trending: Awaited<ReturnType<typeof getTrendingNovels>> = [];
  let session: Awaited<ReturnType<typeof getCurrentSession>> = null;
  try {
    [session, featured, trending] = await Promise.all([
      getCurrentSession(),
      getFeaturedNovels(5),
      getTrendingNovels(10),
    ]);
  } catch {
    // DB/KV may not be configured; show empty sections
  }

  const currentReading = session
    ? await getCurrentReading(session.readerId)
    : null;

  // Fetch news articles: prefer featured, fall back to latest
  let newsArticles: NewsArticleSummary[] = [];
  try {
    newsArticles = await getFeaturedNewsArticles(3);
    if (newsArticles.length === 0) {
      newsArticles = await getLatestNewsArticles(3);
    }
  } catch {
    newsArticles = [];
  }

  // Build search pool from featured + trending for header search
  const allNovels = [...featured, ...trending];
  const uniqueNovels = Array.from(
    new Map(allNovels.map((n) => [n.id, n])).values()
  );
  const searchNovels = uniqueNovels.map((n) => ({
    id: n.id,
    title: n.title,
    authorName: n.authorName,
  }));
  const uniqueAuthors = Array.from(
    new Map(allNovels.map((n) => [n.authorId, { id: n.authorId, name: n.authorName }])).values()
  );
  const searchAuthors = uniqueAuthors.map((a) => ({ id: a.id, name: a.name }));

  const heroItems = featured.slice(0, 3); // Up to 3 for desktop multi-item (THE-49)
  if (heroItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-script text-2xl text-primary">Your shelf is waiting.</p>
      </div>
    );
  }

  return (
    <>
      <BoudoirHeader searchNovels={searchNovels} searchAuthors={searchAuthors} />

      <main className="flex-1 pb-24">
        <HeroCarousel items={heroItems} itemsPerView={{ tablet: 2, desktop: 3 }} />

        <TheLatestSection articles={newsArticles} />

        <CurrentAffairsSection
          currentReading={currentReading}
          isAuthenticated={!!session}
        />

        <HighSocietySection novels={trending.slice(0, 3)} />

        <section className="px-4 xs:px-6 mb-8">
          <VaultTeaserCard />
        </section>
      </main>

      <NavigationBar activeTab="boudoir" />
    </>
  );
}
