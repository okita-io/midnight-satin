import { getReaders } from "@/lib/admin/admin-data";
import { sitePageMetadata } from "@/lib/site-metadata";
import { AdminUsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "Admin — Users",
  "Manage readers and credits in the Midnight Satin admin console."
);

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const readers = await getReaders({ email, limit: 100 });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display italic text-2xl md:text-3xl text-primary mb-6">
        Users
      </h1>

      <AdminUsersClient
        key={email ?? ""}
        initialEmail={email}
        readers={readers}
      />
    </div>
  );
}
