import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
