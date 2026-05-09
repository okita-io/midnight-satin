"use client";

import { useActionState } from "react";
import { registerFormAction } from "@/app/actions/auth";
import { FormField } from "@/app/_components/form-field";

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
      <FormField
        id="register-displayName"
        name="displayName"
        type="text"
        autoComplete="name"
        required
        disabled={isPending}
        label="Display name"
        placeholder="Your name"
      />
      <FormField
        id="register-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isPending}
        label="Email"
        placeholder="you@example.com"
      />
      <FormField
        id="register-password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={isPending}
        label="Password (min. 8 characters)"
        placeholder="••••••••"
      />
      <FormField
        id="register-confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={isPending}
        label="Confirm password"
        placeholder="••••••••"
      />
      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-primary text-void font-header font-bold text-sm tracking-[0.25em] shadow-gold-glow hover:bg-white transition-all duration-300 rounded-none disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
