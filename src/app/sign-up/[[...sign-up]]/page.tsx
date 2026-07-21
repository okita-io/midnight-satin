import { SignUp } from "@clerk/nextjs";
import { safeRedirectPath } from "@/lib/auth/redirect";

/**
 * Fallback route for deep links / cross-links from SignIn.
 * Interactive CTAs use `<SignUpButton mode="modal" />` instead.
 * Theme: Clerk Dashboard → Customization.
 */
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
