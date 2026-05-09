"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { adjustCreditsAction } from "@/app/actions/admin";
import type { Reader } from "@/lib/db/types";
import { formatDateUtcYmd } from "@/lib/format-date-stable";

type UsersAdjustState = {
  email: string;
  adjustingId: string | null;
  adjustAmount: string;
  adjustReason: string;
  loading: boolean;
  error: string | null;
};

type UsersAdjustAction =
  | { type: "set_email"; value: string }
  | { type: "open_adjust"; id: string }
  | { type: "cancel_adjust" }
  | {
      type: "patch_adjust";
      patch: Partial<Pick<UsersAdjustState, "adjustAmount" | "adjustReason">>;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "adjust_success" };

function usersAdjustReducer(
  state: UsersAdjustState,
  action: UsersAdjustAction
): UsersAdjustState {
  switch (action.type) {
    case "set_email":
      return { ...state, email: action.value };
    case "open_adjust":
      return { ...state, adjustingId: action.id, error: null };
    case "cancel_adjust":
      return { ...state, adjustingId: null, error: null };
    case "patch_adjust":
      return { ...state, ...action.patch };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "adjust_success":
      return {
        ...state,
        adjustingId: null,
        adjustAmount: "",
        adjustReason: "",
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

function initialUsersState(initialEmail?: string): UsersAdjustState {
  return {
    email: initialEmail ?? "",
    adjustingId: null,
    adjustAmount: "",
    adjustReason: "",
    loading: false,
    error: null,
  };
}

export function AdminUsersClient({
  initialEmail,
  readers,
}: {
  initialEmail?: string;
  readers: Reader[];
}) {
  const { push, refresh } = useRouter();
  const [state, dispatch] = useReducer(
    usersAdjustReducer,
    initialEmail,
    initialUsersState
  );

  const { email, adjustingId, adjustAmount, adjustReason, loading, error } =
    state;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
    push(`/admin/users${q}`);
  }

  async function handleAdjust(e: React.FormEvent, readerId: string) {
    e.preventDefault();
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) {
      dispatch({ type: "set_error", error: "Amount must be non-zero" });
      return;
    }
    dispatch({ type: "submit_start" });
    const result = await adjustCreditsAction(readerId, amount, adjustReason);
    if (result.success) {
      dispatch({ type: "adjust_success" });
      refresh();
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to adjust" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={email}
          onChange={(e) =>
            dispatch({ type: "set_email", value: e.target.value })
          }
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
                <td className="px-4 py-3 text-text-muted text-sm">
                  {formatDateUtcYmd(r.createdAt)}
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
                        onChange={(e) =>
                          dispatch({
                            type: "patch_adjust",
                            patch: { adjustAmount: e.target.value },
                          })
                        }
                        placeholder="+/- amount"
                        className="w-24 px-2 py-1 bg-void border border-primary/30 rounded-sm text-text-main text-sm"
                      />
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) =>
                          dispatch({
                            type: "patch_adjust",
                            patch: { adjustReason: e.target.value },
                          })
                        }
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
                          onClick={() => dispatch({ type: "cancel_adjust" })}
                          className="px-2 py-1 text-text-muted text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "open_adjust", id: r.id })}
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
