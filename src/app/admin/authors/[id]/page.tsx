import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { notFound } from "next/navigation";
import { AdminAuthorEditForm } from "./author-edit-form";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Edit author",
  "Edit an author profile in the Midnight Satin admin console."
);

export default async function AdminAuthorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await listContent({ type: "authors" });
  const authors = Array.isArray(result) ? result : [];
  const author = authors.find(
    (a): a is typeof a & { type: "author" } => a.type === "author" && a.id === id
  );
  if (!author) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl text-primary mb-6">
        Edit Author
      </h1>
      <AdminAuthorEditForm key={author.id} author={author} />
    </div>
  );
}
