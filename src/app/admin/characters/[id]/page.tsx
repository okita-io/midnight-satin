import { listContent } from "@/lib/admin/admin-data";
import { notFound } from "next/navigation";
import { AdminCharacterEditForm } from "./character-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminCharacterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await listContent({ type: "characters" });
  const characters = Array.isArray(result) ? result : [];
  const item = characters.find(
    (c): c is typeof c & { type: "character" } => c.type === "character" && c.id === id
  );
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl text-primary mb-6">
        Edit Character
      </h1>
      <AdminCharacterEditForm character={item} />
    </div>
  );
}
