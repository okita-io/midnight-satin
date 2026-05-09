"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginFormAction } from "@/app/actions/auth";
import { FormField } from "@/app/_components/form-field";

export function LoginForm({
  redirectTo,
  showResetSuccess = false,
}: {
  redirectTo: string;
  showResetSuccess?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(loginFormAction, null);

  return (
    <form action={formAction} className="w-full space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {/* Success banner after password reset (Req 5.6) */}
      {showResetSuccess && (
        <div
          className="rounded border-2 border-primary bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="status"
        >
          Password updated. Please sign in.
        </div>
      )}
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
        <FormField
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          label="Email"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <FormField
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          label="Password"
        />
      </div>
      <div className="flex justify-end pt-1">
        <Link
          href="/auth/forgot-password"
          className="font-ui text-xs uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          Forgot Password?
        </Link>
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
