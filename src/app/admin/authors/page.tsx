import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { AdminAuthorsClient } from "./authors-client";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Authors",
  "Manage author profiles in the Midnight Satin admin console."
);

export default async function AdminAuthorsPage() {
  const result = await listContent({ type: "authors" });
  const authors = Array.isArray(result) ? result : [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display italic text-2xl md:text-3xl text-primary">
          Authors
        </h1>
        <AdminAuthorsClient />
      </div>

      <div className="bg-surface border border-primary/20 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Name
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Followers
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Created
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {authors
              .filter((a): a is typeof a & { type: "author" } => a.type === "author")
              .map((author) => (
                <tr
                  key={author.id}
                  className="border-b border-primary/10 hover:bg-surface-highlight/50"
                >
                  <td className="px-4 py-3 font-ui">{author.name}</td>
                  <td className="px-4 py-3 text-text-muted">{author.followerCount}</td>
                  <td className="px-4 py-3 text-text-muted text-sm">
                    {new Date(author.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/authors/${author.id}`}
                      className="text-primary hover:underline font-ui text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {authors.length === 0 && (
          <div className="p-8 text-center text-text-muted font-ui">
            No authors yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
