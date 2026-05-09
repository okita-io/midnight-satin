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
    <main className="relative flex min-h-screen w-full flex-col bg-silk-noise overflow-x-hidden">
      {/* Branding */}
      <div className="flex justify-center pt-12 pb-4">
        <span
          className="material-symbols-outlined text-primary text-5xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          menu_book
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 pb-12 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1
            className="font-display font-semibold italic text-[32px] text-primary gold-text-shadow"
            style={{ fontWeight: 700 }}
          >
            Join Midnight Satin
          </h1>
          <p className="font-ui text-text-muted/60 mt-2 text-sm tracking-wide">
            Create an account and receive 200 credits to start
          </p>
        </div>

        {/* Welcome gift card */}
        <div className="relative w-full flex justify-center items-center mb-10">
          <div className="relative bg-surface/80 backdrop-blur-sm border border-primary/20 rounded-sm px-8 py-5 text-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[140px] font-display font-semibold text-primary opacity-10" style={{ fontWeight: 700 }}>
                200
              </span>
            </div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
              <p className="font-header text-primary text-sm tracking-[0.2em] uppercase">Welcome Gift</p>
              <p className="font-display text-2xl text-white font-semibold mt-1" style={{ fontWeight: 700 }}>
                200 Credits
              </p>
            </div>
          </div>
        </div>

        <RegisterForm redirectTo={redirectTo} />
      </div>

      <footer className="mt-auto pt-10 text-center pb-8">
        <p className="font-ui text-sm text-text-muted">
          Already have an account?{" "}
          <Link href={loginLink} className="text-primary underline decoration-primary/40 underline-offset-4 hover:opacity-90">
            Sign in
          </Link>
        </p>
      </footer>
    </main>
  );
}
