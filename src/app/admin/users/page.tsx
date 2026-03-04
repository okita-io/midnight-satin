import { getReaders } from "@/lib/admin/admin-data";
import { AdminUsersClient } from "./users-client";

export const dynamic = "force-dynamic";

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

      <AdminUsersClient initialEmail={email} readers={readers} />
    </div>
  );
}
