"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustCreditsAction } from "@/app/actions/admin";
import type { Reader } from "@/lib/db/types";

export function AdminUsersClient({
  initialEmail,
  readers,
}: {
  initialEmail?: string;
  readers: Reader[];
}) {
  const { push, refresh } = useRouter();
  const [email, setEmail] = useState(() => initialEmail ?? "");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
    push(`/admin/users${q}`);
  }

  async function handleAdjust(e: React.FormEvent, readerId: string) {
    e.preventDefault();
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) {
      setError("Amount must be non-zero");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await adjustCreditsAction(readerId, amount, adjustReason);
    setLoading(false);
    if (result.success) {
      setAdjustingId(null);
      setAdjustAmount("");
      setAdjustReason("");
      refresh();
    } else {
      setError(result.error ?? "Failed to adjust");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Search by email"
          className="flex-1 px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="bg-surface border border-primary/20 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Email
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Display Name
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Credits
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Role
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3">
                Created
              </th>
              <th className="font-header text-xs tracking-wider text-text-muted uppercase px-4 py-3 w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {readers.map((r) => (
              <tr
                key={r.id}
                className="border-b border-primary/10 hover:bg-surface-highlight/50"
              >
                <td className="px-4 py-3 font-ui text-sm">{r.email}</td>
                <td className="px-4 py-3 text-text-muted">{r.displayName ?? "—"}</td>
                <td className="px-4 py-3 text-primary font-ui">{r.creditBalance}</td>
                <td className="px-4 py-3 text-text-muted">{r.role}</td>
                <td
                  className="px-4 py-3 text-text-muted text-sm"
                  suppressHydrationWarning
                >
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {adjustingId === r.id ? (
                    <form
                      onSubmit={(e) => handleAdjust(e, r.id)}
                      className="flex flex-col gap-2"
                    >
                      <input
                        type="number"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="+/- amount"
                        className="w-24 px-2 py-1 bg-void border border-primary/30 rounded-sm text-text-main text-sm"
                      />
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="Reason"
                        className="w-32 px-2 py-1 bg-void border border-primary/30 rounded-sm text-text-main text-sm"
                      />
                      {error && <p className="text-accent text-xs">{error}</p>}
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-2 py-1 bg-primary text-void text-xs rounded-sm"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingId(null);
                            setError(null);
                          }}
                          className="px-2 py-1 text-text-muted text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAdjustingId(r.id)}
                      className="text-primary hover:underline font-ui text-sm"
                    >
                      Adjust credits
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {readers.length === 0 && (
          <div className="p-8 text-center text-text-muted font-ui">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
