import { listContent } from "@/lib/admin/admin-data";
import Link from "next/link";
import { AdminChaptersClient } from "./chapters-client";

export const dynamic = "force-dynamic";

export default async function AdminChaptersPage() {
  const result = await listContent({ type: "chapters" });
  const chapters = Array.isArray(result) ? result : [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display italic text-2xl md:text-3xl text-primary">
          Chapters
        </h1>
        <AdminChaptersClient />
      </div>

      <div className="bg-surface border border-primary/20 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Novel
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                #
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Title
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Free
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {chapters
              .filter((c): c is typeof c & { type: "chapter" } => c.type === "chapter")
              .map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-primary/10 hover:bg-surface-highlight/50"
                >
                  <td className="px-4 py-3 text-text-muted text-sm font-mono">
                    {c.novelId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 font-ui">{c.chapterNumber}</td>
                  <td className="px-4 py-3 font-ui">{c.title}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.isFree ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/chapters/${c.id}`}
                      className="text-primary hover:underline font-ui text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {chapters.length === 0 && (
          <div className="p-8 text-center text-text-muted font-ui">
            No chapters yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
