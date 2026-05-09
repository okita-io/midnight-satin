import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { notFound } from "next/navigation";
import { AdminNovelEditForm } from "./novel-edit-form";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Edit novel",
  "Edit a novel in the Midnight Satin admin console."
);

export default async function AdminNovelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await listContent({ type: "novels" });
  const novels = Array.isArray(result) ? result : [];
  const item = novels.find(
    (n): n is typeof n & { type: "novel" } => n.type === "novel" && n.id === id
  );
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl text-primary mb-6">
        Edit Novel
      </h1>
      <AdminNovelEditForm key={item.id} novel={item} />
    </div>
  );
}
