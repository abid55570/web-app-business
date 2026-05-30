# payment-stripe-subs

Implements `payment-stripe-subs@v1`. Stripe-backed recurring billing on
top of payment-core. Ships Plan + Subscription models, Stripe Checkout
+ Billing Portal session creators, and a deduped webhook handler for the
subscription lifecycle.

## Public endpoints (`/api`)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/plans` | none | Active plans only. |
| POST | `/subscriptions/checkout` | signed-in | `{ planKey, customerRef, successUrl, cancelUrl }` → `{ sessionId, checkoutUrl }`. |
| POST | `/subscriptions/portal` | signed-in | `{ customerRef, returnUrl? }` → `{ portalUrl }`. |
| GET | `/subscriptions/active/{customerRef}` | signed-in | Most-recent non-canceled sub, or `null`. |

## Webhook (`/webhooks`)

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/stripe-subs` | Stripe POSTs here. Idempotent — dedupes on Stripe `event.id` via PK INSERT. Emits bus events. |

## Admin (`/api/admin`)

| Method | Path | Behaviour |
| --- | --- | --- |
| GET / POST | `/plans` | List all (active + inactive) · create. Stripe price id stamped locally; real impl calls `stripe.Price.create`. |
| PATCH | `/plans/{id}` | Edit name / description / amount / active. |
| GET | `/subscriptions` | All subscriptions. |

## Stripe lifecycle handled

- `customer.subscription.created` → upsert + emit `subscription.created`
- `customer.subscription.updated` → upsert + emit `subscription.updated`
- `customer.subscription.deleted` → mark canceled + emit `subscription.canceled`
- `invoice.paid` → emit `subscription.invoice.paid` `{ id, amountCents }`
- `invoice.payment_failed` → emit `subscription.invoice.failed` `{ id, reason }`

## Customer ref convention

`customerRef` is whatever id makes sense for the app — typically the
tenant id when paired with `tenants`, or the user id otherwise. Stripe's
metadata field carries it through so the webhook can match the
Subscription row back.

## Env

- `STRIPE_API_KEY` — secret key.
- `STRIPE_WEBHOOK_SECRET_SUBS` — for the subscription webhook only.
- `STRIPE_PORTAL_RETURN_URL` — fallback if body omits `returnUrl`.

## Pairs with

- `payment-core` (required) — provides the contract.
- `payment-stripe` (optional) — one-off charges; subs is recurring-only.
- `tenants` (optional) — use tenant slug as `customerRef`.
- `audit-log` (optional) — record `subscription.created` etc.
- `notifications` (optional) — email receipts on `invoice.paid`.
