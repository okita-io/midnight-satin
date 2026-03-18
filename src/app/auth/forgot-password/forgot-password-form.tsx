"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/password-reset";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    null
  );

  return (
    <form action={formAction} className="w-full space-y-6">
      {state && (
        <div
          className={`rounded-lg border-2 px-3 py-2 font-ui text-sm ${
            state.success
              ? "border-primary/30 bg-primary/10 text-text-main"
              : "border-accent bg-surface text-text-main"
          }`}
          role="alert"
        >
          {state.message}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="forgot-email"
          className="font-ui text-xs uppercase tracking-widest text-text-muted ml-1"
        >
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="block w-full h-14 rounded-none border border-surface-highlight bg-surface-highlight px-4 font-ui text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-0 transition-colors duration-300"
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 bg-primary text-void font-ui font-bold uppercase tracking-[0.25em] rounded-none shadow-gold-glow hover:bg-white transition-all duration-300 active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
