# Monetization plan

Comprehensive plan for taking b-dash from "shipped catalog + Studio" to "profitable freemium product."

> Status: planning doc. Decisions in here drive what gets built next.
> Companion to [BUSINESS-PLAN.md](../BUSINESS-PLAN.md).
> Owner: founder. Update as decisions are made.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [The model: hosted freemium + premium content](#2-the-model)
3. [What's free vs paid — decision framework](#3-decision-framework)
4. [Pricing tiers (recommended)](#4-pricing-tiers)
5. [Hosted Studio — build path + effort estimate](#5-hosted-studio)
6. [Payment integration — complete path](#6-payment-integration)
7. [Pre-launch decisions](#7-pre-launch-decisions)
8. [12-month launch sequence](#8-launch-sequence)
9. [KPIs to track](#9-kpis-to-track)
10. [Risks + mitigations](#10-risks--mitigations)
11. [Open questions + next decisions](#11-open-questions)
12. [Appendix: competitive pricing reference](#12-appendix)

---

## 1 · Executive summary

**The strategy** in one paragraph:

Run a **hosted Studio** at `studio.b-dash.com` where users build apps for free up to a generous limit. Gate ~20% of the catalog (best themes / premium sections / advanced 3D / paid starters) behind a **$9/mo Pro tier**. Sell white-label + team features at **$49/mo Agency tier**. Charge **enterprise** custom for SSO/on-prem ($500+/mo). All users keep the right to export their code and self-host — that's our moat against Webflow/Wix lock-in.

**The sequence**:
- Months 1–2 — ship hosted Studio + marketing site, drive traffic, **everything free**, instrument analytics
- Months 3–4 — manual sales validation (Gumroad / Payment Links), prove willingness to pay
- Months 5–6 — wire Stripe Checkout + entitlements into the Studio, formalize tiers
- Months 7–12 — scale via SEO, agency partnerships, content marketing

**Key effort estimates** (rough, single founder + occasional contractor):

| Workstream | Effort (weeks) |
|---|---|
| Hosted Studio infrastructure (host the Next.js app, Postgres, S3, real auth) | 3–4 |
| Marketing site + programmatic SEO (one page per starter/theme/section) | 2 |
| Stripe Checkout + entitlements system | 2–3 |
| Premium content pipeline (curating which 20% of catalog is premium) | 1–2 |
| Designer-on-contract building 15 net-new premium themes | 4–6 weeks paid work |
| **Total to monetizable v1** | **~10–14 weeks** of founder effort + $5–15k design budget |

---

## 2 · The model: hosted freemium + premium content

### Why hosted (vs self-hosted-only)

The original BUSINESS-PLAN.md leans toward "customer downloads their app." That's correct for **the generated app** — that's the moat ("you own your code"). But for **the Studio itself**, hosted wins because:

- Canva-style monetization REQUIRES the editor to be hosted (you can't gate premium content in a Studio someone runs on their own laptop)
- Most non-tech users will never run `pnpm install` — hosted lowers the barrier to zero
- Hosted gives you analytics, retention signals, billing — none possible self-hosted
- Self-hosted Studio stays available for power users + agencies who want to white-label

So: **both** modes ship.

| Mode | Who uses it | How they pay |
|---|---|---|
| Hosted Studio at `studio.b-dash.com` | Non-tech, agencies, anyone who just wants to build | Free tier · $9/mo Pro · $49/mo Agency · custom Enterprise |
| Self-hosted Studio (your laptop / Docker) | Devs, agencies with on-prem needs, paranoid customers | Free (forever — it's open source / source-available) |
| Generated app | Always self-hostable by the customer | Free — the wedge |

### What you actually sell

Three concentric circles of value, all delivered via the hosted Studio:

```
┌─────────────────────────────────────────────────────┐
│  ENTERPRISE: SSO · on-prem · custom modules · SLA   │
│  ┌───────────────────────────────────────────────┐  │
│  │ AGENCY: white-label · team seats · clients    │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ PRO: premium content · unlimited renders │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │ FREE: all modules · 80% of catalog │  │  │  │
│  │  │  │ · 1 project · self-host export ✓  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

Free is generous on purpose — you want adoption. Pro adds polish. Agency adds business features. Enterprise adds compliance.

---

## 3 · Decision framework: what's free vs paid

### Hard rule: never gate the foundation

These are FREE forever, no exceptions:

- All 39 modules (the backend functionality)
- 80% of starter recipes (50 of 58)
- The Studio itself (basic usage)
- Self-hosting the generated app
- Self-hosting the Studio (source-available)
- Export to your own GitHub
- All 110 email templates
- All 220 motion presets

**Why never gate these**: if a competitor (or a community fork) can build something equivalent for free in a weekend, you've lost the wedge. Modules are the moat — they need to be free to spread.

### Soft rule: gate the polish layer

Premium = "I want this to look 10× better and ship 10× faster."

- **15 designer themes** (out of 75) — hand-crafted, hero-quality, named after locations or moods
- **108 premium sections** (out of 538) — advanced animations, AI-flavored, premium illustrations baked in
- **10 premium 3D scenes** (out of 40) — the eye-candy ones (Hologram, Galaxy, Planet)
- **2 premium illustration packs** (out of 8) — e.g. spot-marketing, spot-finance with custom hand-drawn replacements
- **8 premium starters** (out of 58) — the vertical-specific high-conversion ones

### Hard rule: gate operational features the free tier doesn't need

These are PAID — they exist for serious users:

- **Hosted preview URLs** (free preview is local-only)
- **Custom domains** on hosted previews
- **Unlimited renders** (free = 3 renders/day, plenty for tinkering)
- **Asset library uploads > 100 MB**
- **More than 1 project**
- **Team seats** (free = solo)
- **White-label** (remove "Built with b-dash" badge)
- **Priority support** (free = community forum)

### The 80/20 ratio

A good freemium ratio for **content** products is **80% free / 20% paid**. Less than 20% paid = users feel they're getting everything; can't justify upgrade. More than 30% paid = users feel crippled; bounce.

Canva: 23M+ images free, ~75M premium (75% paid asset library, 20-25% editor features). But Canva users return weekly so "feel" is set by editor experience not asset count. For us: 80/20 on content + free editor = right balance.

### The decision matrix

For every section / theme / starter, score it on:

| Criterion | Free | Paid |
|---|---|---|
| Build effort | Low / template-derived | High / commissioned designer |
| Visual polish | Solid | Hero / showcase quality |
| Specificity | General-purpose | Vertical-specific or trend-current |
| Composability | Works in 80%+ of contexts | Niche |
| Replacement cost | A weekend of work | A week+ of designer + dev work |

Sum the "paid" attributes. 3+ = candidate for premium tier. 2 or fewer = stays free.

---

## 4 · Pricing tiers (recommended)

### Free — $0/forever

**Limits**:
- 1 active project
- 3 renders per day (resets daily)
- 100 MB asset storage
- Community support only (Discord/forum)
- "Built with b-dash" badge in app footer (subtle, one line)
- Self-host export always available

**Includes**:
- All 39 modules
- 50 of 58 starters
- 60 of 75 themes
- 430 of 538 sections
- All 220 motion presets
- All 110 email templates
- 6 of 8 illustration packs
- 30 of 40 3D scenes
- Studio with all editing features (palette, drag-drop, properties, undo/redo, snapshots)
- Multi-page support
- Auth + workspaces (1 person)

### Pro — $9/mo or $79/yr (save 27%)

**Adds**:
- ✨ 15 premium themes (designer-quality)
- ✨ 108 premium sections (AI-flavored / animated / premium illustrations)
- ✨ 10 premium 3D scenes
- ✨ 2 premium illustration packs
- 5 active projects (up from 1)
- Unlimited renders
- 5 GB asset storage
- Custom domain on hosted preview
- Remove "Built with b-dash" badge
- Email support (48h SLA)
- Early access to new themes (1 week before free tier)

**Target customer**: indie hacker, freelance designer, small-business owner shipping their own site.

### Agency — $49/mo or $399/yr (save 32%)

**Adds**:
- 8 premium starter recipes (high-conversion, niche-specific)
- 25 active projects
- 5 team seats
- Shared workspace (your team sees each other's projects)
- White-label Studio (your logo, your domain like `studio.your-agency.com`)
- Client-access mode (invite client as viewer-only, no edit)
- RBAC fully unlocked (owner/editor/viewer roles)
- Priority support (24h SLA)
- Early access to new content (2 weeks before free)
- Monthly office-hours call with b-dash team

**Target customer**: digital agencies, web-design studios, freelance dev who builds for clients.

### Enterprise — from $500/mo, custom

**Adds**:
- Unlimited projects + seats
- SSO / SAML
- SOC2 / DPA / custom contracts
- On-prem deployment of Studio
- Custom module development (priced separately)
- Custom theme commissioning (priced separately)
- 99.9% SLA
- Dedicated Slack channel
- Quarterly strategy review

**Target customer**: large agencies, internal teams at mid-market companies, regulated industries.

### One-time add-ons (Gumroad-style)

For customers who don't want subscriptions:

- **Theme pack** — $19 one-time, perpetual access to one premium theme + future updates
- **Mega bundle** — $149 one-time, perpetual access to ALL current premium content (good for "I'm building this site once")
- **Starter recipe** — $39 one-time, perpetual access to one premium starter

These keep low-volume non-subscribers on the value curve and act as feature-discovery for the subscription tiers.

### Pricing rationale (vs competitors)

| Competitor | Free tier | Mid tier | Top tier |
|---|---|---|---|
| Canva | yes (limited) | Pro $15/mo | Teams $30/mo |
| Webflow | yes (2 pages) | Basic $14/mo | CMS $23/mo · Business $39/mo |
| Wix | yes (with ads) | Light $16/mo | Business $32/mo |
| Lovable | yes (5 messages/day) | Pro $25/mo | $50–100/mo usage |
| WordPress.com | yes (with ads) | Personal $4/mo | Business $25/mo |
| **b-dash** | **yes (generous)** | **Pro $9/mo** | **Agency $49/mo** |

You're priced below Canva because you have less to give (no AI image gen, smaller asset library). You're priced above WordPress.com because you have far better DX + visual builder. The Agency tier targets a real gap — Webflow's $39 Business plan caps at 100 form submissions / 10k visitors / no white-label; you're cheaper AND give white-label.

---

## 5 · Hosted Studio — build path + effort estimate

This is the single biggest investment between today and monetization.

### Current state

The Studio at `apps/studio/` already has:
- ✅ Next.js 15 app, runs on port 3001
- ✅ All editor features (S1–S5d)
- ✅ Auth + workspaces + RBAC (S5b) — but JSON-file backed
- ✅ Asset library (S5a) — local FS backed
- ✅ Comments, snapshots, templates — all local-FS backed
- ✅ Render to wirer — works via subprocess

What's missing for prod hosted:
- ❌ Real database (Postgres)
- ❌ Real OAuth (Google/GitHub/Email)
- ❌ S3/R2 asset storage
- ❌ Stripe Checkout + webhooks + entitlements
- ❌ Multi-tenant isolation (currently single-workspace JSON)
- ❌ Background job queue for renders (currently blocks request)
- ❌ Marketing site at `b-dash.com` (root domain)
- ❌ Hosting deploy (Vercel / Fly / Railway)
- ❌ Custom domain support on hosted previews
- ❌ Email sending (welcome, billing, password resets)
- ❌ Observability (Sentry, PostHog already in catalog — wire them)

### Architecture target

```
                          ┌─────────────────────┐
                          │  b-dash.com         │
                          │  (marketing site)   │
                          │  Next.js · static   │
                          └──────────┬──────────┘
                                     │
                                     ▼
┌──────────────────┐         ┌─────────────────────┐
│  studio.b-dash   │ ◄─────► │  app.b-dash.com     │
│  (the editor)    │         │  (api gateway)      │
│  Next.js · SSR   │         │  Express / Hono     │
└──────────────────┘         └──────────┬──────────┘
       │                                │
       │                                ▼
       │                     ┌──────────────────────┐
       │                     │  Postgres (workspaces│
       │                     │  users, billing,     │
       │                     │  entitlements)       │
       │                     └──────────────────────┘
       │                                │
       │                                ▼
       │                     ┌──────────────────────┐
       └────────────────────►│  S3 / R2             │
                             │  (asset uploads,     │
                             │  rendered artifacts) │
                             └──────────────────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │  Background worker   │
                             │  (renders via wirer  │
                             │  subprocess)         │
                             └──────────────────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │  preview-{id}        │
                             │  .b-dash.com         │
                             │  (rendered apps,     │
                             │  per-user subdomain) │
                             └──────────────────────┘
```

### Build phases (weeks of founder effort)

#### Phase H1 — Production backend (3 weeks)

| Task | Effort | Notes |
|---|---|---|
| Spin up Postgres (Supabase / Neon / Railway) | 1 day | Managed, no ops |
| Migrate auth from JSON to Postgres | 2 days | Schema: users, sessions, workspaces, members |
| Migrate workspaces + snapshots + templates + comments to Postgres | 3 days | Existing API stays, swap storage layer |
| Wire OAuth via next-auth (Google + GitHub + Email) | 2 days | Replace S5b's cookie+JSON |
| Migrate asset library to S3 / Cloudflare R2 | 2 days | R2 is cheaper, S3 has more libs |
| Background job queue for renders (Inngest / Trigger.dev / BullMQ) | 3 days | Renders take 5–60s, can't block requests |
| Multi-tenant isolation review (row-level security in Postgres) | 2 days | Critical security boundary |
| Email sending via Resend (you already have the module) | 1 day | Welcome / billing / password reset |
| Observability — wire Sentry + PostHog (also already in catalog) | 1 day | |
| **H1 total** | **~3 weeks** | |

#### Phase H2 — Stripe integration (2 weeks)

| Task | Effort | Notes |
|---|---|---|
| Stripe account setup, products + prices configured | 1 day | 3 products: Pro, Agency, Enterprise |
| Stripe Checkout integration | 2 days | Use Stripe-hosted Checkout (don't build forms) |
| Webhook endpoint for subscription events | 2 days | Listen for: created, updated, cancelled, payment_failed |
| Entitlements table + middleware | 3 days | "Can user X access premium theme Y?" |
| Billing portal (Stripe Customer Portal) | 1 day | Stripe-hosted, no code |
| Email triggers for billing events | 1 day | Welcome, trial-ending, payment-failed, cancellation |
| Test mode → live mode cutover | 2 days | Test thoroughly with Stripe test keys first |
| **H2 total** | **~2 weeks** | |

#### Phase H3 — Marketing site (2 weeks)

| Task | Effort | Notes |
|---|---|---|
| Marketing site scaffold at b-dash.com | 2 days | Could literally use b-dash to build it |
| Programmatic SEO pages — 1 per starter (58), 1 per theme (75), 1 per top-100 sections | 5 days | Generate from manifests; deploy on push |
| Pricing page (with Stripe Checkout buttons) | 1 day | |
| Docs site (re-host docs/ via Nextra or Docusaurus) | 2 days | |
| Demo site — pre-built showcase apps live, browse + remix | 2 days | "See what others built" |
| Newsletter signup (ConvertKit / Buttondown) | 0.5 day | Capture leads pre-launch |
| **H3 total** | **~2 weeks** | |

#### Phase H4 — Polish & launch readiness (1–2 weeks)

| Task | Effort | Notes |
|---|---|---|
| Custom-domain support on hosted previews | 2 days | Vercel API or CloudFront |
| Render quota enforcement | 1 day | Free = 3/day; tracked in Postgres |
| Asset storage quota enforcement | 1 day | Free = 100 MB; signed S3 uploads |
| White-label settings UI (Agency tier) | 2 days | Custom domain, custom logo upload |
| Team-seats management UI | 2 days | Invite teammates, role management |
| Rate limiting on all endpoints | 1 day | Cloudflare / Vercel edge middleware |
| Status page (statuspage.io / Better Stack) | 0.5 day | Trust signal for Agency/Enterprise |
| Terms of service + Privacy policy + DPA template | 1 day | Use Termly or commission a template |
| **H4 total** | **~1.5 weeks** | |

#### Phase H5 — Designer-on-contract premium content (4–6 weeks paid work, runs in parallel)

| Task | Effort | Cost estimate |
|---|---|---|
| Brief: 15 premium themes, 8 premium starters | 1 week | — |
| Designer contract — themes (15 themes × ~1 day each = 3 weeks) | 3 weeks | $3,000–$7,500 ($200–500/day) |
| Designer contract — starters (8 starters × 0.5 day = 4 days) | 1 week | $800–$2,000 |
| Premium 3D scenes (10, you build or contract) | 1 week | $0 (you) or $2,000 |
| Premium illustration packs (2, hand-drawn) | 2 weeks | $1,500–$3,000 |
| Visual review + QA | 0.5 week | — |
| **H5 total** | **4–6 weeks calendar / parallel to H1–H4** | **$5,000–$15,000** |

### Effort summary

| Phase | Founder weeks | Calendar (assumes 4 day/week pace) |
|---|---|---|
| H1 prod backend | 3 | 4 weeks |
| H2 Stripe | 2 | 2.5 weeks |
| H3 marketing site | 2 | 2.5 weeks |
| H4 polish | 1.5 | 2 weeks |
| H5 designer (parallel, $) | (4–6 weeks of contractor work) | — |
| **Total founder time** | **~8.5 weeks** | **~11 weeks calendar (~2.5 months)** |

You can ship the hosted Studio + Stripe in **~2.5 months of full-time founder work + $5–15k design budget**.

If you only work nights/weekends (1 day/week effective), multiply by 4 → ~10 months.

---

## 6 · Payment integration — complete path

### Stripe is the only sensible choice

Why not LemonSqueezy / Paddle / Polar?

- **Stripe** = best DX, lowest fees (2.9% + 30¢ in US), most flexible — but you handle tax compliance yourself
- **Paddle / LemonSqueezy** = merchant-of-record, handles tax for you, but 5–8% fees and less flexible

**Recommendation**: start with Stripe. If you grow to $50k MRR and tax compliance gets painful, migrate to Paddle. Don't optimize for hypothetical future tax-handling pain.

### Integration steps (detailed)

#### Step 1 — Account setup

1. Create Stripe account at stripe.com
2. Activate live mode (requires legal entity + tax ID)
3. Configure tax behavior:
   - Inclusive vs exclusive pricing (US convention = exclusive, EU = inclusive)
   - Stripe Tax for auto-calculation of VAT/GST (small fee per tx, worth it)
4. Set up products in Stripe Dashboard:
   - **Pro** product, with monthly + annual prices
   - **Agency** product, with monthly + annual prices
   - **Enterprise** product, with custom-priced setup (manual invoicing)
5. Configure Customer Portal (Stripe-hosted, no code needed)

#### Step 2 — Stripe Checkout integration

```ts
// Studio: app/api/checkout/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { tier, billingCycle } = await req.json()  // 'pro' | 'agency'; 'monthly' | 'annual'
  const user = await authResolve(req)
  if (!user) return new Response('unauthenticated', { status: 401 })

  const priceId = PRICE_IDS[tier][billingCycle]   // mapped to Stripe price IDs

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://studio.b-dash.com/billing/success?session={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://studio.b-dash.com/pricing',
    client_reference_id: user.id,
    metadata: { userId: user.id, tier, billingCycle },
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
  })

  return Response.json({ url: session.url })
}
```

Frontend: button calls `/api/checkout` → redirects to Stripe-hosted checkout page → on success returns to your app.

#### Step 3 — Webhook handler

```ts
// Studio: app/api/webhooks/stripe/route.ts
const events = [
  'checkout.session.completed',           // user paid first time
  'customer.subscription.updated',        // upgrade/downgrade/renew
  'customer.subscription.deleted',        // cancelled
  'invoice.payment_failed',               // dunning
]

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await db.entitlements.upsert({
        userId: session.metadata!.userId,
        tier: session.metadata!.tier,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: 'active',
        activeUntil: null,  // active subscription, not expired
      })
      await sendEmail(session.customer_email!, 'welcome-to-pro')
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await db.entitlements.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status: 'cancelled', activeUntil: new Date(sub.current_period_end * 1000) },
      })
      break
    }
    case 'invoice.payment_failed': {
      // Stripe auto-retries 4 times over 1 week. After that, sub goes to past_due.
      const inv = event.data.object as Stripe.Invoice
      await sendEmail(inv.customer_email!, 'payment-failed')
      break
    }
  }
  return Response.json({ received: true })
}
```

Configure webhook endpoint in Stripe Dashboard → Webhooks → add `https://studio.b-dash.com/api/webhooks/stripe`.

#### Step 4 — Entitlements middleware

```ts
// Studio: lib/entitlements.ts
export async function userTier(userId: string): Promise<'free' | 'pro' | 'agency' | 'enterprise'> {
  const ent = await db.entitlements.findUnique({ where: { userId } })
  if (!ent) return 'free'
  if (ent.status === 'cancelled' && ent.activeUntil && ent.activeUntil < new Date()) return 'free'
  return ent.tier
}

export const PREMIUM_THEMES = new Set([
  'aurora', 'helio', 'jade', 'copper', 'midnight', /* ...15 total */
])
export const PREMIUM_SECTIONS = new Set([/* 108 ids */])
export const PREMIUM_3D = new Set([/* 10 ids */])

export async function canUseSection(userId: string, sectionId: string): Promise<boolean> {
  if (!PREMIUM_SECTIONS.has(sectionId)) return true
  const tier = await userTier(userId)
  return tier !== 'free'
}
```

Wire into existing API routes:

```ts
// app/api/sections/route.ts — filter out premium for free users
const tier = await userTier(userId)
const blocks = allBlocks.map((b) => ({
  ...b,
  isPremium: PREMIUM_SECTIONS.has(b.id),
  isLocked: PREMIUM_SECTIONS.has(b.id) && tier === 'free',
}))
```

Studio UI: render locked sections with a 🔒 badge in the palette + a "Pro" pill in the section detail. Clicking them opens upgrade modal instead of inserting.

#### Step 5 — Billing portal

```ts
// Studio: app/api/billing/portal/route.ts
export async function POST(req: Request) {
  const user = await authResolve(req)
  const ent = await db.entitlements.findUnique({ where: { userId: user!.id } })
  const session = await stripe.billingPortal.sessions.create({
    customer: ent!.stripeCustomerId,
    return_url: 'https://studio.b-dash.com/settings/billing',
  })
  return Response.json({ url: session.url })
}
```

Add a "Manage subscription" button in Studio settings — opens Stripe's hosted portal where users update payment method, view invoices, cancel.

#### Step 6 — Test → live

- All development uses Stripe test keys (cards `4242 4242 4242 4242` etc.)
- Switch env vars to live keys when ready
- Run through full flow with a real $9 charge to your own card → refund yourself
- Monitor Stripe Dashboard for first real customer

### Tax / VAT

For US-only launch: nothing to do beyond Stripe Tax enabled.

For global launch:
- **B2C** (selling to individuals in EU/UK/AU): Stripe Tax handles VAT/GST automatically (~$0.50/tx fee)
- **B2B** (selling to companies): collect VAT ID at checkout, Stripe Tax handles reverse-charge
- **Filing**: still your job. Use [TaxJar](https://taxjar.com) / [Avalara](https://avalara.com) for filing automation if revenue exceeds $30k/yr

For first 6 months at low volume: Stripe Tax + manual quarterly review is fine.

### Refund policy

Standard SaaS pattern:
- **Pro**: 30-day money-back guarantee, no questions asked
- **Agency**: 14-day money-back, prorated thereafter
- **Enterprise**: per contract

Refunds via Stripe Dashboard one-click. Build this into your support workflow from day 1.

---

## 7 · Pre-launch decisions

### Decision: what's premium (specific list)

Action: spend 1 week reviewing the catalog and tagging each item. Add a `premium: true` flag to:

- `sections/<cat>/<id>/section.yaml`
- `themes/<id>/theme.yaml`
- `starters/<id>/recipe.json`

Then update the studio block-manifest emitter to include the flag. Then update the catalog API to return it.

Criteria for "this is premium" (re-stated):
- Took more than a day to design
- Uses commissioned illustration / typography
- Is vertical-specific high-conversion (e.g. "AI SaaS landing")
- Has motion / 3D that requires extra QA effort
- Is what people would screenshot and share

### Decision: initial pricing

**Recommendation: launch with the pricing in §4** ($9 / $49 / custom).

Don't over-think this. Pricing is iterable post-launch (you can change it any time; existing subscribers grandfather at their original price). What MATTERS is shipping the pricing button — even at "wrong" prices.

If pricing is wrong:
- Too low → easy to raise after 6 months ("price increase, existing users keep $9 for life")
- Too high → easy to lower or run promos ("limited-time $5/mo for first 3 months")

The bigger risk is **not pricing anything at all** — you learn nothing about willingness to pay.

### Decision: trial vs free tier

Two models:

| Model | How it works | Pros | Cons |
|---|---|---|---|
| **Free tier** (recommended) | Forever-free with limits; upgrade for more | Adoption flywheel; no time pressure on user; lower CAC | Lower conversion to paid |
| **Free trial** | 14 days free, then forced to pay or downgrade | Higher conversion (urgency) | Worse adoption signal; CAC dependence on conversion |

**Pick free tier**. You're a developer-tool-adjacent product. Free-tier adoption is your moat. Companies like Vercel, Supabase, PlanetScale all use free tier — none use trial. WordPress.com uses free tier. Webflow uses free tier. Wix uses free tier.

### Decision: hosted-only or self-host option

**Both, from day 1**. The source code stays open (or source-available with a non-compete license). Self-hosters can run everything for free forever. This is critical:

- Defends against "lock-in" criticism
- Gives agencies + enterprises a path to on-prem
- Lets the community contribute (sections, themes)
- Keeps your honest — if hosted Studio sucks, self-host is the alternative

Tradeoff: small fraction of would-be Pro customers self-host instead. That's fine — those people weren't going to pay anyway, and they spread the word.

### Decision: branding / footer

- Free tier: "Built with b-dash" line in footer (subtle, one line, links to b-dash.com)
- Pro tier: removable
- Agency tier: removable + replace with your own attribution

This single decision drives meaningful conversion. Notion did this. Vercel does this. It works.

### Decision: company structure

If you're not already incorporated:

- **For US**: Delaware C-corp via Stripe Atlas ($500, 2 weeks). Required for VC funding later.
- **For US (bootstrap)**: LLC via your home state ($50–500). Simpler taxes.
- **For India**: Private Limited via Razorpay's Rize. ₹6,500 + ~2 weeks.
- **For UK**: Ltd Co via Companies House (£12 + same day).

Without incorporation you can't open a Stripe account. So this gate-keeps the whole monetization plan.

---

## 8 · 12-month launch sequence

### Month 1 — Foundation

- Week 1–2: Phase H1 part 1 (Postgres + auth migration)
- Week 3: Phase H1 part 2 (S3 + background queue)
- Week 4: Phase H1 part 3 (email + observability + multi-tenant)
- Parallel: brief designer for premium themes

**End of M1**: hosted Studio at `studio.b-dash.com`, real auth, real DB. Free for everyone. No payments yet.

### Month 2 — Marketing + content

- Week 5–6: Phase H3 marketing site + SEO landing pages
- Week 7: Phase H4 polish (quotas, white-label UI, status page)
- Week 8: Beta-launch to friends-and-family. Collect feedback.

**End of M2**: ~50 beta users, marketing site live, traffic starting from SEO.

### Month 3 — Validation

- Week 9: Email top 20 beta users — "would you pay $X for Y?"
- Week 10: Fulfill manual sales via Stripe Payment Links + Gumroad
- Week 11–12: Public launch (Product Hunt, Hacker News, Twitter)

**End of M3**: $500–2,000 MRR via manual sales. Real signal on what people pay for.

### Month 4 — Stripe integration

- Week 13–14: Phase H2 part 1 (Checkout + webhook + entitlements)
- Week 15: Phase H2 part 2 (billing portal + email triggers)
- Week 16: Live Stripe rollout. Migrate manual customers to Stripe subscriptions.

**End of M4**: paid plans live, ~50 paid users, $1k–5k MRR.

### Month 5–6 — Scale traffic

- Programmatic SEO compounds (3–6 month lag from launch)
- Build 5–10 case studies / tutorials per month
- Twitter/X presence building in public ("$5k MRR" "$10k MRR" milestones drive attention)
- Affiliate program (50% on first month for first 6 months — Canva-style)

**End of M6**: $10–25k MRR, 200–500 paid users.

### Month 7–9 — Agency channel

- Cold outreach to 100 web-design agencies
- Build "Agency demo" video + sales deck
- White-label feature gets emphasis
- Close 10–20 agency tier customers

**End of M9**: $30–50k MRR, agency channel proven.

### Month 10–12 — Enterprise + content engine

- Land first 2–3 enterprise customers (referrals from agencies)
- Hire a content/community person (community manager + designer)
- Catalog growth becomes ongoing (you've already shipped year-1 catalog — now it's monthly cadence)
- Consider raising seed round IF you want to grow faster

**End of Y1**: $50–100k MRR target. Profitable on Pro+Agency tiers. Enterprise opportunistic.

---

## 9 · KPIs to track

### From day 1 (free tier launch)

| Metric | Target M3 | Target M6 | Target M12 |
|---|---|---|---|
| Weekly active users (WAU) | 500 | 2,000 | 10,000 |
| Signups | 100/wk | 400/wk | 1,500/wk |
| Renders per week | 1,000 | 5,000 | 25,000 |
| 7-day retention | 30% | 35% | 40% |
| 30-day retention | 15% | 20% | 25% |

### After paid tiers launch

| Metric | Target M6 | Target M9 | Target M12 |
|---|---|---|---|
| Free → Pro conversion | 1% | 2% | 3% |
| Pro → Agency conversion | 3% | 5% | 8% |
| Monthly churn | 8% | 6% | 5% |
| MRR | $10k | $30k | $50k |
| ARR | $120k | $360k | $600k |
| Paid customers | 200 | 600 | 1,200 |
| CAC | < $30 | < $40 | < $50 |
| LTV | > $200 | > $300 | > $400 |
| LTV / CAC ratio | > 7 | > 7 | > 8 |

Instrument with PostHog (already in your catalog) for free-tier behavior + Stripe Dashboard for revenue. Build a simple Notion dashboard for weekly review.

---

## 10 · Risks + mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Traffic doesn't materialize | High | Critical | Programmatic SEO is the cheapest insurance. Invest 2 weeks up front. Plus Product Hunt + Twitter. If still flat at M3, pivot to agency cold outreach |
| Free tier too generous → no upgrades | Medium | High | Tighten quotas at M6 if conversion < 1%. Make premium content visibly tempting (preview but locked) |
| Free tier too tight → no adoption | Medium | High | Watch WAU growth. If < 200 WAU at M3, loosen quotas |
| Stripe payment compliance issues | Low | Medium | Use Stripe Tax. Don't sell to sanctioned countries. Keep clean terms of service |
| Catalog grows stale (no new themes) | Medium | Medium | Budget $1k–2k/mo for community designer rev share. Open community theme submissions in M9 |
| Single founder burnout | High | Critical | Time-box phases. Take Sundays off. Hire help at $20k MRR (community manager) |
| Hosting bills exceed revenue at low scale | Low | Medium | Vercel free tier handles up to ~10k users. Move to Fly/Railway when needed. Postgres on Neon's free tier first |
| Competitor (e.g. Lovable) adds visual builder | High | High | Your moat is owned-code + curated inventory. Compete on quality of premium content, not speed of AI |
| Customer wants feature you don't have | Constant | Low | Roadmap-aware response. "Not now, but ranked X on roadmap". Don't build everything |

---

## 11 · Open questions + next decisions

These need answers before execution:

1. **Hosting provider for Studio**: Vercel (familiar, expensive at scale) vs Railway (cheaper, less mature) vs Fly (best perf, harder DX)?
   - Recommendation: **Vercel** for M1–M6, migrate to Fly at $10k MRR if needed
2. **Database**: Neon (serverless Postgres) vs Supabase (Postgres + auth + storage all-in-one) vs Railway (simple managed Postgres)?
   - Recommendation: **Supabase** — you get auth + storage + DB in one product, saves M1 time
3. **Asset storage**: S3 vs Cloudflare R2 (zero egress fees) vs Backblaze B2?
   - Recommendation: **R2** for cost + simplicity
4. **Background jobs**: Inngest (TS-first, hosted) vs BullMQ (self-host, free) vs Trigger.dev?
   - Recommendation: **Inngest** for hosted simplicity; switch to BullMQ if cost matters
5. **OAuth providers** to ship first?
   - Recommendation: **GitHub + Google + Email magic-link** (covers 95%)
6. **Designer**: hire one freelancer OR multiple per-pack?
   - Recommendation: one freelance designer on retainer for 4–6 weeks to ship the launch batch, then opportunistic
7. **Pricing in non-USD**: support EUR/GBP/INR at launch?
   - Recommendation: USD only at launch. Stripe handles foreign cards. Add localized pricing post-product-market-fit (M9+)
8. **Free tier limit on projects**: 1 (strict) or 3 (generous)?
   - Recommendation: **1**. Makes the upgrade incentive clear. You can loosen to 2–3 if adoption suffers
9. **Sunset date for current self-hosted-only version**: never (keep open source) vs add commercial-use restriction?
   - Recommendation: **never**. Keep open source. The hosted convenience + premium content carry the monetization
10. **First paid theme batch**: 15 themes or 5 themes?
    - Recommendation: **15** — needs to feel like real value vs free tier. 5 looks paltry

---

## 12 · Appendix — competitive pricing reference

Apples-to-apples comparison of tools customers might shop between:

### Website / app builders

| Tool | Free | Mid tier | Top tier | Annual save | Custom domain |
|---|---|---|---|---|---|
| **b-dash** (this plan) | ✓ generous | $9/mo Pro | $49/mo Agency | 27–32% | yes |
| Canva | ✓ limited | Pro $15/mo | Teams $30/mo | 16% | yes (Pro+) |
| Webflow | ✓ 2 pages | Basic $14/mo | Business $39/mo | 17% | yes |
| Wix | ✓ with ads | Light $16/mo | Business $32/mo | 15% | yes |
| Framer | ✓ with badge | Mini $5/mo | Pro $20/mo | 17% | yes |
| Squarespace | — | Personal $16/mo | Advanced $52/mo | 30% | yes |
| Lovable | ✓ 5 msgs/day | Pro $25/mo | $50–100/mo | varies | self-host |
| v0 (Vercel) | ✓ 200 credits | $20/mo | $50/mo | — | self-host |
| Bolt.new | ✓ limited | $20/mo | $200/mo | — | self-host |
| WordPress.com | ✓ with ads | Personal $4/mo | Business $25/mo | 22% | yes (paid) |

### Design tools (Canva-adjacent)

| Tool | Free | Pro tier | Team tier |
|---|---|---|---|
| Canva | ✓ | $15/mo | $30/mo (5 users) |
| Figma | ✓ | $15/mo/editor | $45/mo/editor |
| Adobe Express | ✓ | $10/mo | $19/mo |

### Developer tool pricing patterns (for reference)

| Tool | Free tier | Paid baseline |
|---|---|---|
| Vercel | Hobby (generous) | Pro $20/mo |
| Supabase | Free (up to 500MB DB) | Pro $25/mo |
| PlanetScale | Free | Scaler $39/mo |
| Stripe | Pay-as-you-go | 2.9% + 30¢ |

**Reads from this table**:
- $9 Pro tier is aggressive on price. Easy to raise to $12–15 if conversion is strong.
- $49 Agency tier is competitive with Webflow Business ($39) + white-label.
- Free tier with badge in footer is industry-standard.
- Annual savings of 25–30% is industry norm.

---

## Bottom line

You can be at **$10k MRR within 6 months** if:

1. You spend 2.5 months full-time on hosted Studio + Stripe + marketing site (~$0 cost beyond hosting + $5–15k design)
2. You launch with the pricing in §4 ($9 Pro / $49 Agency)
3. You invest in programmatic SEO from day 1 (cheapest growth lever you have)
4. You're disciplined about the free / paid line (80/20 — don't gate too much, don't give away the polish)
5. You validate willingness to pay manually before building Stripe (M3 — talk to users, sell with Payment Links)

You can be at **$50k MRR by month 12** if you additionally:

6. Open an agency-channel motion (cold outreach + case studies) at M7
7. Land 2–3 enterprise customers via agency referrals by M10
8. Hire one community/content person at $20k MRR (M6–7)

**The biggest single risk is traffic**, not product. The product is largely built. Spend disproportionate time on SEO + launch + content marketing in M1–M3.

---

*End of monetization plan. Next milestone: pick answers to the 10 open questions in §11.*
