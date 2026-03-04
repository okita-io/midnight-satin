import { listContent } from "@/lib/admin/admin-data";
import Link from "next/link";
import { AdminNovelsClient } from "./novels-client";

export const dynamic = "force-dynamic";

export default async function AdminNovelsPage() {
  const result = await listContent({ type: "novels" });
  const novels = Array.isArray(result) ? result : [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display italic text-2xl md:text-3xl text-primary">
          Novels
        </h1>
        <AdminNovelsClient />
      </div>

      <div className="bg-surface border border-primary/20 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Title
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Author
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Rating
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {novels
              .filter((n): n is typeof n & { type: "novel" } => n.type === "novel")
              .map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-primary/10 hover:bg-surface-highlight/50"
                >
                  <td className="px-4 py-3 font-ui">{n.title}</td>
                  <td className="px-4 py-3 text-text-muted text-sm font-mono">
                    {n.authorId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-text-muted">{n.rating}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/novels/${n.id}`}
                      className="text-primary hover:underline font-ui text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {novels.length === 0 && (
          <div className="p-8 text-center text-text-muted font-ui">
            No novels yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
