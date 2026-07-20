import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { safeRedirectPath } from "@/lib/auth/redirect";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRedirectPath(params.redirect_url);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn
        appearance={clerkAppearance}
        signUpUrl={
          redirectUrl === "/"
            ? "/sign-up"
            : `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
        }
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
