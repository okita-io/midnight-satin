import { getCurrentReader } from "@/app/actions/auth";

export default async function ProfilePage() {
  const reader = await getCurrentReader();

  return (
    <main className="min-h-screen p-6 pb-safe-bottom pt-safe-top">
      <h1 className="font-display font-bold italic text-2xl text-[var(--primary)]">Profile</h1>
      {reader && (
        <p className="font-ui text-[var(--text-muted)] mt-2">
          {reader.displayName ?? reader.email} · {reader.creditBalance} credits
        </p>
      )}
    </main>
  );
}
