import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { notFound } from "next/navigation";
import { AdminChapterEditForm } from "./chapter-edit-form";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Edit chapter",
  "Edit a chapter in the Midnight Satin admin console."
);

export default async function AdminChapterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, result] = await Promise.all([
    params,
    listContent({ type: "chapters" }),
  ]);
  const chapters = Array.isArray(result) ? result : [];
  const item = chapters.find(
    (c): c is typeof c & { type: "chapter" } => c.type === "chapter" && c.id === id
  );
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl text-primary mb-6">
        Edit Chapter
      </h1>
      <AdminChapterEditForm key={item.id} chapter={item} />
    </div>
  );
}
