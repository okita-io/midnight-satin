"use client";

import { useActionState } from "react";
import { registerFormAction } from "@/app/actions/auth";

const inputBase =
  "w-full h-14 bg-surface-highlight border-2 border-surface-highlight focus:border-primary text-text-main font-ui px-4 outline-none transition-colors duration-300 rounded-sm placeholder:text-text-muted";
const labelBase = "block font-ui text-[10px] uppercase tracking-[0.15em] text-text-muted ml-1";

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(registerFormAction, null);

  return (
    <form action={formAction} className="w-full space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {/* Validation message: same position on mobile, tablet, desktop */}
      {state?.error && (
        <div
          className="rounded-sm border-2 border-accent bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="register-displayName" className={labelBase}>
          Display name
        </label>
        <input
          id="register-displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
          className={inputBase}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-email" className={labelBase}>
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className={inputBase}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-password" className={labelBase}>
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
          className={inputBase}
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="register-confirmPassword" className={labelBase}>
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
          className={inputBase}
          placeholder="••••••••"
        />
      </div>
      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-primary text-void font-header font-bold text-sm tracking-[0.2em] shadow-gold-glow hover:bg-white transition-all duration-300 rounded-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
