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
            Welcome back
          </h1>
          <p className="font-ui text-text-muted mt-2 text-sm tracking-widest uppercase">
            Sign in to continue
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>

      <footer className="p-8 text-center mt-auto">
        <p className="font-ui text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href={registerLink} className="text-primary border-b border-primary/50 pb-0.5 hover:opacity-90">
            Register
          </Link>
        </p>
      </footer>
    </main>
  );
}
