import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Register | Midnight Satin",
  description: "Create your Midnight Satin account.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;
  const redirectTo = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
  const loginLink = returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/auth/login";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-safe-bottom pt-safe-top">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold italic text-3xl text-[var(--primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Join Midnight Satin
          </h1>
          <p className="font-ui text-[var(--text-muted)] mt-2 tracking-wide" style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem" }}>
            Create an account and receive 200 credits to start
          </p>
        </div>

        <RegisterForm redirectTo={redirectTo} />

        <p className="font-ui text-center mt-6 text-[var(--text-muted)]" style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href={loginLink} className="text-[var(--primary)] border-b border-primary/50 pb-0.5 hover:opacity-90">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
