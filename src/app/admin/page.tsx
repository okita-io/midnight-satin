import { getContentOverview, getUserAnalytics } from "@/lib/admin/admin-data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [contentStats, userAnalytics] = await Promise.all([
    getContentOverview(),
    getUserAnalytics(),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display italic text-2xl md:text-3xl text-primary mb-6">
        Dashboard Overview
      </h1>

      <section className="mb-8">
        <h2 className="font-header text-sm tracking-wider text-text-muted uppercase mb-3">
          Content
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Authors"
            value={contentStats.authors}
            href="/admin/authors"
          />
          <StatCard
            label="Series"
            value={contentStats.series}
            href="/admin/series"
          />
          <StatCard
            label="Novels"
            value={contentStats.novels}
            href="/admin/novels"
          />
          <StatCard
            label="Chapters"
            value={contentStats.chapters}
            href="/admin/chapters"
          />
          <StatCard
            label="Characters"
            value={contentStats.characters}
            href="/admin/characters"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-header text-sm tracking-wider text-text-muted uppercase mb-3">
          Users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Readers"
            value={userAnalytics.totalReaders}
            href="/admin/users"
          />
          <StatCard
            label="Active (7d)"
            value={userAnalytics.activeReaders7d}
            href="/admin/users"
          />
          <StatCard
            label="Credits Purchased"
            value={userAnalytics.totalCreditsPurchased}
          />
          <StatCard
            label="Credits Spent"
            value={userAnalytics.totalCreditsSpent}
          />
        </div>
      </section>

      <section>
        <Link
          href="/admin/comments"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-primary/40 rounded-sm text-primary font-ui text-sm hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">comment</span>
          Moderate Comments
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="bg-surface border border-primary/20 rounded-sm p-4">
      <div className="font-display italic text-2xl text-primary">{value}</div>
      <div className="font-ui text-sm text-text-muted">{label}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
