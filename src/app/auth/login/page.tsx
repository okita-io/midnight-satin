import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In | Midnight Satin",
  description: "Sign in to your Midnight Satin account.",
};

/** Legacy route — Clerk owns sign-in now. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;
  const redirectUrl =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
  redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
}
