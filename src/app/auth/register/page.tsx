import { redirect } from "next/navigation";

export const metadata = {
  title: "Register | Midnight Satin",
  description: "Create your Midnight Satin account.",
};

/** Legacy route — Clerk owns sign-up now. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;
  const redirectUrl =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
  redirect(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
}
