import Link from "next/link";
import { validateResetToken } from "@/lib/auth/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Reset Password | Midnight Satin",
  description: "Set a new password for your Midnight Satin account.",
};

const INVALID_TOKEN_MESSAGE =
  "This reset link is no longer valid. Please request a new one.";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const rawToken = (token ?? "").trim();

  const validation =
    rawToken.length > 0 ? await validateResetToken(rawToken) : { valid: false };

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-silk-noise">
      {/* Decorative blurs */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full">
        {/* Branding icon */}
        <div className="mb-8">
          <span
            className="material-symbols-outlined text-primary text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display font-bold italic text-4xl text-primary">
            Reset password
          </h1>
          <p className="font-ui text-text-muted mt-2 text-sm tracking-widest uppercase">
            {validation.valid ? "Set your new password" : "Link expired or invalid"}
          </p>
        </div>

        {validation.valid ? (
          <ResetPasswordForm token={rawToken} />
        ) : (
          <div
            className="w-full rounded-sm border-2 border-accent bg-surface px-4 py-6 text-center"
            role="alert"
          >
            <p className="font-ui text-text-main">{INVALID_TOKEN_MESSAGE}</p>
            <Link
              href="/auth/forgot-password"
              className="mt-4 inline-block font-ui text-sm text-primary border-b border-primary/50 pb-0.5 hover:opacity-90"
            >
              Request a new reset link
            </Link>
          </div>
        )}
      </div>

      <footer className="p-8 text-center mt-auto">
        <p className="font-ui text-sm text-text-muted">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-primary border-b border-primary/50 pb-0.5 hover:opacity-90"
          >
            Sign in
          </Link>
        </p>
      </footer>
    </main>
  );
}
