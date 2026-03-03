"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginFormAction } from "@/app/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(loginFormAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {state?.error && (
        <div
          className="rounded border border-[var(--accent)] bg-[var(--surface)] px-3 py-2 font-ui text-sm text-[var(--text-main)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <button type="submit" disabled={isPending} className="btn-gold w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
