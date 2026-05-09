import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsArticle, getNewsAttribution } from "@/lib/content";
import { MetadataPills } from "@/app/_components/metadata-pills";
import { OrnamentalDivider } from "@/app/_components/reading-room/ornamental-divider";
import { NavigationBar } from "@/app/_components/navigation-bar";
import { BackButton } from "./back-button";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) {
    return { title: "Article | Midnight Satin" };
  }
  const description =
    article.summary.length > 160
      ? `${article.summary.slice(0, 157)}…`
      : article.summary;
  return {
    title: `${article.title} | Midnight Satin`,
    description,
  };
}

/** Platform display labels and Material Symbols icon names */
const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  tiktok: { label: "TikTok", icon: "play_circle" },
  instagram: { label: "Instagram", icon: "photo_camera" },
  x: { label: "X", icon: "tag" },
  youtube: { label: "YouTube", icon: "smart_display" },
  facebook: { label: "Facebook", icon: "thumb_up" },
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);

  if (!article) notFound();

  const attribution = getNewsAttribution(article);
  const platform = article.sourcePlatform
    ? PLATFORM_META[article.sourcePlatform]
    : null;

  const paragraphs = article.bodyContent.split(/\n\n+/).flatMap((p) => {
    const t = p.trim();
    return t ? [t] : [];
  });

  return (
    <>
      {/* Parallax hero */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        {article.heroImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${article.heroImageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted opacity-30 text-7xl">
              article
            </span>
          </div>
        )}

        {/* Gradient fade to void */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 w-full px-6 pb-10 flex flex-col items-center text-center z-10">
          <h1 className="text-3xl md:text-4xl font-display italic font-semibold text-white leading-tight gold-text-shadow">
            {article.title}
          </h1>

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <p className="text-sm text-white/80 font-ui tracking-wide hero-text-shadow">
              {attribution}
            </p>
            {platform && (
              <span className="flex items-center gap-1 text-xs text-primary font-ui tracking-wide">
                <span className="material-symbols-outlined text-sm">{platform.icon}</span>
                {platform.label}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <MetadataPills tags={article.tags} />
          </div>
        </div>
      </div>

      <main className="relative z-10 bg-void min-h-screen pb-28">
        {/* Back button */}
        <div className="px-6 pt-6">
          <BackButton />
        </div>

        {/* Summary lead paragraph */}
        <div className="reading-max-width px-6 mt-6">
          <p className="font-body text-lg italic text-text-muted leading-relaxed text-center">
            {article.summary}
          </p>
          <OrnamentalDivider />
        </div>

        {/* Body content — Reading Room typography */}
        {paragraphs.length > 0 && (
          <article
            className="reading-max-width px-6"
            style={{ fontSize: "18px", lineHeight: 1.6 }}
          >
            {paragraphs.map((text, i) => (
              <p
                key={i}
                className={`font-body text-text-main/90 text-justify mb-6 ${i === 0 ? "drop-cap" : ""}`}
              >
                {text}
              </p>
            ))}
          </article>
        )}

        {/* Campaign CTA */}
        {article.articleType === "campaign" && article.sourceUrl && (
          <div className="reading-max-width px-6 mt-8 flex justify-center">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block text-center"
            >
              Visit Campaign
            </a>
          </div>
        )}
      </main>

      <NavigationBar activeTab="updates" />
    </>
  );
}
