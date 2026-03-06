import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In | Midnight Satin",
  description: "Sign in to your Midnight Satin account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;
  const redirectTo = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
  const registerLink = returnUrl ? `/auth/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/auth/register";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 xs:px-6 pb-safe-bottom pt-safe-top">
      <div className="w-full max-w-md md:max-w-[480px] mx-auto">
        <div className="text-center mb-6 xs:mb-8">
          <h1 className="font-display font-bold italic text-2xl xs:text-3xl text-[var(--primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back
          </h1>
          <p className="font-ui text-[var(--text-muted)] mt-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem" }}>
            Sign in to continue
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />

        <p className="font-ui text-center mt-6 text-[var(--text-muted)]" style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem" }}>
          Don&apos;t have an account?{" "}
          <Link href={registerLink} className="text-[var(--primary)] border-b border-primary/50 pb-0.5 hover:opacity-90">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
