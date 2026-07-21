# Backend-payments subagent

**Scope:** Credit purchases: purchaseCredits Server Action, payment provider integration (e.g. Stripe Checkout), webhook route with idempotency, and credit grant on success.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Stripe / payment webhooks | Checkout session, webhook handler, idempotency, credit_transaction records |
| Vercel Postgres, TypeScript | Transactions, reader balance update, audit records |

## Task scope (from `tasks.md`)

- 12.2 — purchaseCredits action, `/api/webhooks/stripe` (unified; legacy `/api/webhooks/payment` alias), Payment_Provider integration, idempotent credit grant

## Dependencies

- Requires **backend-data** (schema, credit_transactions, readers.credit_balance).
- Requires **backend-auth** (session for authenticated purchase).

## Reference

- Requirements: 8.4–8.6 in `.kiro/specs/midnight-satin-platform/requirements.md`
- Design doc: payment flow, credit invariants (Property 6)
