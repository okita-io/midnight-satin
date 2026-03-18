"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/password-reset";

const inputBase =
  "w-full h-14 bg-surface-highlight border border-surface-highlight focus:border-primary text-text-main font-ui px-4 outline-none transition-colors duration-300 rounded-none placeholder:text-text-muted/60";
const labelBase =
  "block font-ui text-[10px] uppercase tracking-[0.15em] text-text-muted ml-1";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    null
  );

  return (
    <form action={formAction} className="w-full space-y-5">
      {/* Validation error: invalid email format (Req 1.4) */}
      {state?.success === false && (
        <div
          className="rounded-sm border-2 border-accent bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="alert"
        >
          {state.message}
        </div>
      )}
      {/* Generic success message after submission (Req 1.5) */}
      {state?.success === true && (
        <div
          className="rounded-sm border-2 border-primary/50 bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="status"
        >
          {state.message}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className={labelBase}>
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className={inputBase}
          placeholder="you@example.com"
        />
      </div>
      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-primary text-void font-header font-bold text-sm tracking-[0.25em] shadow-gold-glow hover:bg-white transition-all duration-300 rounded-none disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100"
        >
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </div>
    </form>
  );
}
