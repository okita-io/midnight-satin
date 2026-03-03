import { notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import { NavigationBar } from "../../_components/navigation-bar";
import { authorStudyPath } from "@/lib/navigation";

export const revalidate = 60;

export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ novelId: string }>;
}) {
  const { novelId } = await params;
  interface NovelRow {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    cover_image_url: string | null;
    synopsis: string | null;
    genre_tags: string[];
    rating: number;
    rating_count: number;
  }

  let novel: NovelRow | null = null;

  try {
    const { rows } = await sql<NovelRow>`
      SELECT n.id, n.title, n.author_id, n.cover_image_url, n.synopsis,
             n.genre_tags, n.rating, n.rating_count, COALESCE(a.name, 'Unknown') AS author_name
      FROM novels n
      LEFT JOIN author_profiles a ON a.id = n.author_id
      WHERE n.id = ${novelId}
    `;
    novel = rows[0] ?? null;
  } catch {
    // DB may not be configured
  }

  if (!novel) notFound();

  return (
    <>
      <main style={{ flex: 1, paddingBottom: "6rem" }}>
        <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--void)" }}>
            {novel.cover_image_url ? (
              <img alt="" style={{ height: "100%", width: "100%", objectFit: "cover", opacity: 0.7 }} src={novel.cover_image_url} />
            ) : (
              <div style={{ height: "100%", width: "100%", background: "var(--surface)" }} />
            )}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--void), transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem" }}>
            <h1 className="font-display" style={{ fontStyle: "italic", fontWeight: "bold", fontSize: "2rem", color: "white", marginBottom: "0.5rem" }}>
              {novel.title}
            </h1>
            <Link href={authorStudyPath(novel.author_id)} className="font-ui" style={{ color: "var(--primary)", fontSize: "0.875rem" }}>
              {novel.author_name}
            </Link>
          </div>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {novel.synopsis && (
            <p className="font-body" style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--text-main)" }}>
              {novel.synopsis}
            </p>
          )}
          {novel.rating > 0 && (
            <p className="font-ui" style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
              {novel.rating.toFixed(1)} {novel.rating_count > 0 ? `(${novel.rating_count} reviews)` : ""}
            </p>
          )}
        </div>
      </main>
      <NavigationBar activeTab="boudoir" />
    </>
  );
}
