# Security notes (launch-prep)

Operational AuthZ and webhook notes from the launch-prep audit. See also [AUTH.md](./AUTH.md).

## Server actions

| Class | Mechanism |
|-------|-----------|
| Signed-in mutations (unlock, endorse, bookmark, follow, comments, reviews, progress, purchases) | `getSession()`; writes use `session.readerId` only |
| Admin mutations | `checkAdminSession` (`readers.role === 'admin'`) |
| Admin pages | `requireAdminPage()` in `/admin` layout |
| Public reads | Comments list, news pagination, catalog |

Locked chapter bodies are truncated server-side via `teaserContentForLockedChapter` before props reach the client.

Paperback checkout fails closed unless `NEXT_PUBLIC_PAPERBACK_ENABLED` and `NEXT_PUBLIC_PAPERBACK_PURCHASE_ENABLED` are both `"true"`.

## Webhooks

| Endpoint | Auth | Notes |
|----------|------|-------|
| `/api/webhooks/clerk` | Clerk `verifyWebhook` | Missing/invalid → 400. `user.deleted` soft-unlinks only (see AUTH.md). |
| `/api/webhooks/payment` | Stripe signature | Credits from `CREDIT_PACKS[pack_id]` (not metadata amount). Non–credit-pack events ACK 200. Misconfigured secrets → 400. |
| `/api/webhooks/stripe` | Stripe signature | Paperback orders. Non–paperback events ACK 200. Misconfigured secrets → 400. |

Webhooks are excluded from Clerk `auth.protect()` in `src/proxy.ts`.

## MCP

`/api/mcp` requires `MCP_API_KEY` (or `API_KEY`). Unset key → **503** fail closed. Wrong key → **401**. In-memory rate limit ~120 req/min per key fingerprint. Create/update tool calls emit structured `mcp_audit` logs (key fingerprint, tool name, optional entity id — never raw chapter content).

MCP tools only mutate content tables (authors/series/novels/chapters/characters). They cannot set `readers.role` or grant credits.

### Rotate MCP key

1. Generate a new high-entropy secret; set `MCP_API_KEY` in Vercel Preview/Production.
2. Update agent configs / Romance Factory to the new key.
3. Remove the old key from Vercel; redeploy so all instances pick up the change.
4. Confirm old key returns 401.

