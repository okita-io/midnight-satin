import type { NewsArticle } from "@/lib/db/types";

/** Platform display labels and Material Symbols icon names */
const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  tiktok: { label: "TikTok", icon: "play_circle" },
  instagram: { label: "Instagram", icon: "photo_camera" },
  x: { label: "X", icon: "tag" },
  youtube: { label: "YouTube", icon: "smart_display" },
  facebook: { label: "Facebook", icon: "thumb_up" },
};

interface CampaignDetailProps {
  article: Pick<NewsArticle, "articleType" | "sourceUrl" | "sourcePlatform">;
}

/**
 * Renders campaign-specific UI elements for the article detail view:
 * - Platform label/icon when sourcePlatform is set
 * - "Visit Campaign" CTA when articleType is "campaign" and sourceUrl is non-null
 *
 * This component mirrors the conditional rendering logic in the article detail
 * page (`src/app/updates/[slug]/page.tsx`) and is extracted for testability.
 */
export function CampaignDetail({ article }: CampaignDetailProps) {
  const platform = article.sourcePlatform
    ? PLATFORM_META[article.sourcePlatform]
    : null;

  return (
    <>
      {/* Platform label */}
      {platform && (
        <span className="flex items-center gap-1 text-xs text-primary font-ui tracking-wide">
          <span className="material-symbols-outlined text-sm">
            {platform.icon}
          </span>
          {platform.label}
        </span>
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
    </>
  );
}
