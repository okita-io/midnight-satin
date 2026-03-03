import { notFound } from "next/navigation";
import { sql } from "@vercel/postgres";
import { NavigationBar } from "../../_components/navigation-bar";

export const revalidate = 60;

export default async function AuthorStudyPage({
  params,
}: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await params;
  interface AuthorRow {
    id: string;
    name: string;
    avatar_url: string | null;
    biography: string | null;
    style_tags: string[];
    follower_count: number;
  }

  let author: AuthorRow | null = null;

  try {
    const { rows } = await sql<AuthorRow>`
      SELECT id, name, avatar_url, biography, style_tags, follower_count
      FROM author_profiles
      WHERE id = ${authorId}
    `;
    author = rows[0] ?? null;
  } catch {
    // DB may not be configured
  }

  if (!author) notFound();

  return (
    <>
      <main style={{ flex: 1, paddingBottom: "6rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 4,
              overflow: "hidden",
              border: "2px solid var(--primary)",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {author.avatar_url ? (
              <img alt="" src={author.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined text-primary text-4xl">person</span>
              </div>
            )}
          </div>
          <h1 className="font-display" style={{ fontStyle: "italic", fontWeight: "bold", fontSize: "1.75rem", color: "white", marginTop: "1rem" }}>
            {author.name}
          </h1>
          <p className="font-ui" style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {author.follower_count} followers
          </p>
        </div>
        {author.biography && (
          <p className="font-body italic text-center" style={{ color: "var(--text-main)", lineHeight: 1.6, marginBottom: "2rem" }}>
            &ldquo;{author.biography}&rdquo;
          </p>
        )}
      </main>
      <NavigationBar activeTab="boudoir" />
    </>
  );
}
