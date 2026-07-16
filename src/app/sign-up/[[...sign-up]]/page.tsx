import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { safeRedirectPath } from "@/lib/auth/redirect";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRedirectPath(params.redirect_url);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignUp
        appearance={clerkAppearance}
        signInUrl={
          redirectUrl === "/"
            ? "/sign-in"
            : `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
        }
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
