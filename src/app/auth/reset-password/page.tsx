import { redirect } from "next/navigation";

export const metadata = {
  title: "Reset Password | Midnight Satin",
  description: "Choose a new Midnight Satin password.",
};

/** Password reset is handled by Clerk. */
export default function ResetPasswordPage() {
  redirect("/sign-in");
}
