import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { AdminCharactersClient } from "./characters-client";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Characters",
  "Manage characters in the Midnight Satin admin console."
);

export default async function AdminCharactersPage() {
  const result = await listContent({ type: "characters" });
  const characters = Array.isArray(result) ? result : [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display italic text-2xl md:text-3xl text-primary">
          Characters
        </h1>
        <AdminCharactersClient />
      </div>

      <div className="bg-surface border border-primary/20 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Name
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Novel
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Role
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Endorsements
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {characters.flatMap((c) =>
              c.type === "character"
                ? [
                    <tr
                      key={c.id}
                      className="border-b border-primary/10 hover:bg-surface-highlight/50"
                    >
                      <td className="px-4 py-3 font-ui">{c.name}</td>
                      <td className="px-4 py-3 text-text-muted text-sm font-mono">
                        {c.novelId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-text-muted">{c.roleSubtitle ?? "—"}</td>
                      <td className="px-4 py-3 text-text-muted">{c.endorsementCount}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/characters/${c.id}`}
                          className="text-primary hover:underline font-ui text-sm"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>,
                  ]
                : []
            )}
          </tbody>
        </table>
        {characters.length === 0 && (
          <div className="p-8 text-center text-text-muted font-ui">
            No characters yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
