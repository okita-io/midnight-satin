import { requireAdminPage } from "@/lib/auth/admin";
import { AdminShell } from "./admin-shell";

/**
 * Admin requires Clerk sign-in (proxy) AND Neon `readers.role === 'admin'`.
 * Non-admins are redirected to the Boudoir — they never see admin UI or data.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage("/");
  return <AdminShell>{children}</AdminShell>;
}
