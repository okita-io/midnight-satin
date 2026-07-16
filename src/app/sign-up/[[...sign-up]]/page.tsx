import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
