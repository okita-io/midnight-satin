import { redirect } from "next/navigation";

export const metadata = {
  title: "Forgot Password | Midnight Satin",
  description: "Reset your Midnight Satin password.",
};

/** Password recovery is handled by Clerk. */
export default function ForgotPasswordPage() {
  redirect("/sign-in");
}
