import { listContent } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { notFound } from "next/navigation";
import { AdminSeriesEditForm } from "./series-edit-form";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Edit series",
  "Edit a series in the Midnight Satin admin console."
);

export default async function AdminSeriesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await listContent({ type: "series" });
  const series = Array.isArray(result) ? result : [];
  const item = series.find(
    (s): s is typeof s & { type: "series" } => s.type === "series" && s.id === id
  );
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl text-primary mb-6">
        Edit Series
      </h1>
      <AdminSeriesEditForm key={item.id} series={item} />
    </div>
  );
}
