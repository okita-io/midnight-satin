"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/password-reset";

const inputBase =
  "w-full h-14 bg-surface-highlight border border-surface-highlight focus:border-primary text-text-main font-ui px-4 outline-none transition-colors duration-300 rounded-none placeholder:text-text-muted/60";
const labelBase =
  "block font-ui text-[10px] uppercase tracking-[0.15em] text-text-muted ml-1";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  return (
    <form action={formAction} className="w-full space-y-5">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <div
          className="rounded-sm border-2 border-accent bg-surface px-3 py-2 font-ui text-sm text-text-main"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="reset-password" className={labelBase}>
          New password (min. 8 characters)
        </label>
        <input
          id="reset-password"
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
        <label htmlFor="reset-confirmPassword" className={labelBase}>
          Confirm password
        </label>
        <input
          id="reset-confirmPassword"
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
          className="w-full h-14 bg-primary text-void font-header font-bold text-sm tracking-[0.25em] shadow-gold-glow hover:bg-white transition-all duration-300 rounded-none disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100"
        >
          {isPending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
