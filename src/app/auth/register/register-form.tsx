"use client";

import { useActionState } from "react";
import { registerFormAction } from "@/app/actions/auth";

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(registerFormAction, null);

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
        <label htmlFor="register-email" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Email
        </label>
        <input
          id="register-email"
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
        <label htmlFor="register-displayName" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Display name
        </label>
        <input
          id="register-displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Password (min. 8 characters)
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={isPending}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="register-confirmPassword" className="mb-1 block font-ui text-sm text-[var(--text-muted)]">
          Confirm password
        </label>
        <input
          id="register-confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={isPending}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <button type="submit" disabled={isPending} className="btn-gold w-full">
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
