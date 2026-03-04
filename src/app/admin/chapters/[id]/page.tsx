import { listContent } from "@/lib/admin/admin-data";
import { notFound } from "next/navigation";
import { AdminChapterEditForm } from "./chapter-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminChapterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await listContent({ type: "chapters" });
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
      <AdminChapterEditForm chapter={item} />
    </div>
  );
}
