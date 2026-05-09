import { getCommentsForModeration } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { AdminCommentsClient } from "./comments-client";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Comments",
  "Moderate reader comments in the Midnight Satin admin console."
);

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const includeDeleted = deleted === "1";
  const comments = await getCommentsForModeration({
    includeDeleted,
    limit: 200,
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display italic text-2xl md:text-3xl text-primary mb-6">
        Comment Moderation
      </h1>

      <AdminCommentsClient
        comments={comments}
        includeDeleted={includeDeleted}
      />
    </div>
  );
}
