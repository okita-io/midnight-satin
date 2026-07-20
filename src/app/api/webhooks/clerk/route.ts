import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { upsertReaderFromClerkWebhook } from "@/lib/auth/clerk-reader";
import { sql } from "@vercel/postgres";

/**
 * Clerk user lifecycle → Neon `readers` sync.
 * Configure endpoint in Clerk Dashboard → Webhooks:
 *   POST /api/webhooks/clerk
 * Events: user.created, user.updated, user.deleted
 */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        await upsertReaderFromClerkWebhook(evt.data);
        break;
      }
      case "user.deleted": {
        const id = evt.data.id;
        if (id) {
          // Soft-unlink rather than cascade-delete reading history.
          await sql`
            UPDATE readers
            SET clerk_user_id = NULL
            WHERE clerk_user_id = ${id}
          `;
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Clerk webhook handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
