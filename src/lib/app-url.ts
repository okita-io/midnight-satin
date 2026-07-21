import { headers } from "next/headers";

/**
 * Absolute origin for Stripe return URLs, emails, etc.
 *
 * Prefer the browser's host over `VERCEL_URL` — on Vercel, `VERCEL_URL` is the
 * per-deployment `*.vercel.app` hostname, which breaks Clerk cookies when
 * Stripe redirects there after checkout on the custom domain.
 */
export async function getAppBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && !host.includes("localhost")) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`;
    }
    if (host) {
      return `http://${host}`;
    }
  } catch {
    // headers() unavailable outside a request (e.g. some tests)
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return `https://${productionHost.replace(/^https?:\/\//, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
