import { notFound } from "next/navigation";
import { getAuthor, getAuthorBibliography } from "@/lib/content";
import { getCurrentSession } from "@/app/actions/auth";
import { isAuthorFollowed } from "@/app/actions/follow";
import { NavigationBar } from "../../_components/navigation-bar";
import { AuthorStudyHeader } from "../../_components/author/author-study-header";
import { HexagonAvatar } from "../../_components/author/hexagon-avatar";
import { BiographySection } from "../../_components/author/biography-section";
import { TrophyCase, type AuthorTrophy } from "../../_components/author/trophy-case";
import { BibliographySection } from "../../_components/author/bibliography-section";
import { FollowButton } from "../../_components/author/follow-button";

export const revalidate = 60;

function formatFollowerCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default async function AuthorStudyPage({
  params,
}: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await params;

  const [author, bib, session] = await Promise.all([
    getAuthor(authorId),
    getAuthorBibliography(authorId),
    getCurrentSession(),
  ]);

  if (!author) notFound();

  const isAuthenticated = !!session;
  const followed = isAuthenticated ? await isAuthorFollowed(authorId) : false;

  const genreTags = author.styleTags.length > 0 ? author.styleTags : ["Romance"];
  const genreLabel = genreTags.join(" • ");

  const trophies: AuthorTrophy[] = [];
  if (bib.worksCount >= 10) {
    trophies.push({
      id: "quill",
      icon: "history_edu",
      name: "Golden Quill",
      description: "10+ Works",
    });
  }
  if (author.followerCount >= 1000) {
    trophies.push({
      id: "roses",
      icon: "favorite",
      name: "Million Roses",
      description: "1k+ Followers",
    });
  }
  if (bib.avgRating >= 4.5 && bib.worksCount >= 3) {
    trophies.push({
      id: "rating",
      icon: "star",
      name: "Top Rated",
      description: "4.5+ Avg",
    });
  }

  return (
    <>
      <AuthorStudyHeader authorName={author.name} />

      <main className="flex-1 pb-24">
        <section className="relative px-4 xs:px-6 pt-6 xs:pt-8 pb-8 xs:pb-10 flex flex-col items-center text-center">
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 size-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none"
            aria-hidden
          />
          <HexagonAvatar
            src={author.avatarUrl}
            alt={`Portrait of ${author.name}`}
          />
          <h1 className="text-2xl xs:text-3xl font-display italic text-text-main mb-1">
            {author.name}
          </h1>
          <p className="text-text-muted text-sm font-header tracking-widest mb-4">
            {genreLabel}
          </p>
          <div className="flex items-center gap-6 mb-6 text-sm text-text-main/80">
            <div className="flex flex-col items-center">
              <span className="font-display text-lg text-primary">
                {bib.worksCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                Works
              </span>
            </div>
            <div className="w-px h-8 bg-[#393528]" aria-hidden />
            <div className="flex flex-col items-center">
              <span className="font-display text-lg text-primary">
                {formatFollowerCount(author.followerCount)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                Followers
              </span>
            </div>
            <div className="w-px h-8 bg-[#393528]" aria-hidden />
            <div className="flex flex-col items-center">
              <span className="font-display text-lg text-primary">
                {bib.avgRating > 0 ? bib.avgRating.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                Rating
              </span>
            </div>
          </div>
          <FollowButton
            authorId={authorId}
            initialFollowed={followed}
            isAuthenticated={isAuthenticated}
          />
        </section>

        <div className="px-4 xs:px-6 md:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-[7fr_13fr] md:gap-12 lg:gap-16">
          <div className="flex flex-col">
            <BiographySection biography={author.biography} styleTags={author.styleTags} />
            <TrophyCase trophies={trophies} />
          </div>
          <div>
            <BibliographySection groups={bib.groups} />
          </div>
        </div>
      </main>

      <NavigationBar activeTab="boudoir" />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
    </>
  );
}
