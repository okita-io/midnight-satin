import { getCurrentSession } from "@/app/actions/auth";
import { NavigationBar } from "./_components/navigation-bar";
import { BoudoirHeader } from "./_components/boudoir-header";
import { HeroCarousel } from "./_components/hero-carousel";
import { CurrentAffairsSection } from "./_components/current-affairs-section";
import { HighSocietySection } from "./_components/high-society-section";
import { VaultTeaserCard } from "./_components/vault-teaser-card";
import {
  getFeaturedNovels,
  getTrendingNovels,
  getCurrentReading,
} from "@/lib/content";

export const revalidate = 60; // ISR: 60s revalidation per design doc

export default async function BoudoirPage() {
  const [session, featured, trending] = await Promise.all([
    getCurrentSession(),
    getFeaturedNovels(),
    getTrendingNovels(),
  ]);

  const currentReading = session
    ? await getCurrentReading(session.readerId)
    : null;

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

  const heroNovel = featured[0];
  if (!heroNovel) {
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
        <HeroCarousel featured={heroNovel} />

        <CurrentAffairsSection
          currentReading={currentReading}
          isAuthenticated={!!session}
        />

        <HighSocietySection novels={trending} />

        <section className="px-6 mb-8">
          <VaultTeaserCard />
        </section>
      </main>

      <NavigationBar activeTab="boudoir" />
    </>
  );
}
