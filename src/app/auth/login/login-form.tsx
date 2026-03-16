"use client";

import { useActionState } from "react";
import { loginFormAction } from "@/app/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(loginFormAction, null);

  return (
    <form action={formAction} className="w-full space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {/* Validation message: same position on mobile, tablet, desktop */}
      {state?.error && (
        <div
          className="rounded border-2 border-accent bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="font-ui text-xs uppercase tracking-widest text-text-muted ml-1">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="block w-full h-14 rounded-none border border-surface-highlight bg-surface-highlight px-4 font-ui text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-0 transition-colors duration-300"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="font-ui text-xs uppercase tracking-widest text-text-muted ml-1">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="block w-full h-14 rounded-none border border-surface-highlight bg-surface-highlight px-4 font-ui text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-0 transition-colors duration-300"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 bg-primary text-void font-ui font-bold uppercase tracking-[0.25em] rounded-none shadow-gold-glow hover:bg-white transition-all duration-300 active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
