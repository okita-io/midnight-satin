import { listContent } from "@/lib/admin/admin-data";
import { notFound } from "next/navigation";
import { AdminAuthorEditForm } from "./author-edit-form";

export const dynamic = "force-dynamic";

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
      <AdminAuthorEditForm author={author} />
    </div>
  );
}
