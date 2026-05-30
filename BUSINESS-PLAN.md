# B-Dash App Generator — Business Plan

> Business-level overview for non-technical stakeholders.
> Companion document to `PLAN.md` (technical detail).
> Last updated: 2026-05-09

---

## Executive Summary

B-Dash is an application generator that produces production-ready, customer-owned websites and web apps by composing pre-built modules, themes, and integrations — without writing any new code per customer.

It serves three customer types from a single platform:
- **Operators** (you / agencies) — generate apps for clients via a guided wizard
- **Non-technical business owners** — pick from a Template Gallery and customize via a visual builder
- **Power users / individual creators** — assemble apps from 250+ modules

The system covers everything from a simple to-do app to a multi-vendor marketplace. It runs entirely offline — no AI APIs, no recurring SaaS bills, no per-app variable cost. Optional AI features are available as add-ons that customers connect with their own keys.

The core wedge: **customer-owned code + zero variable cost + visual builder + vast pre-built inventory**. No competitor offers all four.

---

## The Opportunity

Small businesses, individual creators, and agencies need digital presence and digital tools, but the existing options each have a major gap:

| Option | Strength | Weakness |
|---|---|---|
| Custom dev / agencies | Bespoke quality | $5k–$50k, weeks-to-months delivery |
| Wix / Webflow / Squarespace | Visual builder | Locked in, monthly fees, no code ownership |
| Shopify | E-commerce focus | Transaction fees, locked-in, e-commerce only |
| WordPress + plugins | Open ecosystem | Maintenance hell, security risk, plugin fees |
| Lovable / v0 / Bolt (AI generators) | Fast generation | Variable LLM cost, fragile output, brand fit varies |

**The gap**: nobody combines (custom-app quality) + (visual builder for non-tech) + (customer owns code) + (no recurring cost).

A US-based small-business website typically costs $1,500–$5,000 to build and $30–$300/month to host on a SaaS platform. A clinic that wants appointment booking faces $50–$200/month for that single feature alone. The combined cost over 5 years easily exceeds $10,000 for what is, structurally, a solved problem.

B-Dash brings the cost to near-zero by shifting from "rebuild every time" to "compose from pre-built parts."

---

## The Solution

B-Dash is a meta-system organized around three layers:

**Contracts** — stable interface definitions like "Auth", "Orders", "Booking", "Payment".
**Implementations** — multiple pre-built backend, frontend, and integration templates that satisfy each contract.
**Recipes** — a customer's specific selection of which implementations to use, plus their config.

Because all implementations of a contract are interchangeable, customers can mix any backend with any frontend with any integrations without writing code. The system simply wires the chosen pieces together and packages the result as a deployable application the customer owns.

### The three customer-facing experiences

| Surface | Who uses it | What it does |
|---|---|---|
| **Template Gallery** | "I want something like X" | Browse 200+ complete starter apps; pick one; brand it; deploy |
| **Wizard** | "Walk me through it" | Plain-language decision tree; smart defaults; takes 10–20 minutes |
| **Studio (visual builder)** | "I'll build it myself" | Drag-drop visual editor; click-to-edit text; visual color/font/spacing pickers; no code visible |

All three converge to the same generated output. The customer always ends up with code they own.

---

## Customer Segments

### Segment 1: Small business owners (primary, mass-market)
Restaurants, clinics, retail shops, salons, services. Want online ordering, appointments, payments. Currently underserved — agencies are too expensive, DIY builders too generic.
- **Volume**: very high
- **Willingness to pay**: low individually, high in aggregate
- **Pricing fit**: free with optional paid themes / managed hosting

### Segment 2: Individual creators
Photographers, writers, podcasters, freelancers, coaches, artists. Want portfolios, blogs, newsletters, course platforms.
- **Volume**: high
- **Willingness to pay**: low–medium
- **Pricing fit**: free with optional premium themes

### Segment 3: Agencies and freelance developers
Build sites for end-clients. Want speed and reusability. Will pay for the leverage.
- **Volume**: medium
- **Willingness to pay**: high
- **Pricing fit**: white-label subscription, agency tier

### Segment 4: Internal tool builders (small teams, startups)
Need quick admin panels, dashboards, CRMs. Want full control.
- **Volume**: medium
- **Willingness to pay**: medium
- **Pricing fit**: free with optional commercial license / support

### Segment 5: Educators and event organizers
Course platforms, signup forms, event RSVPs.
- **Volume**: medium
- **Willingness to pay**: low–medium
- **Pricing fit**: free, optional premium features

---

## Value Propositions

### For end customers (business owners, creators)
- **Own your code.** Export and deploy anywhere. Never locked in.
- **No monthly platform fee.** Pay once or never; host where you want.
- **Customize visually.** No developer needed for changes.
- **Optional AI features** with your own API key — no markup.
- **Production-grade defaults.** Security, accessibility, performance baked in.

### For agencies and freelancers
- **Deliver client work in days, not weeks.**
- **Reuse components across clients.**
- **Customers can self-serve edits**, reducing your support load.
- **White-label option** — sell as your own product.

### For us (the maker)
- **Zero variable cost** per app generated.
- **No ongoing API bills** tied to customer activity.
- **Sustainable free or one-time pricing.**
- **Asset library compounds** — each new theme/module increases the value of every existing one through composition.

---

## Product Overview (high-level)

Five layered components:

| Component | What it is |
|---|---|
| **Generator** | The engine that wires templates into a complete app and packages it |
| **Modules** (250+ at year-1) | Pre-built feature units — auth, orders, appointments, payments, AI chat, etc. |
| **Themes** (60+ at year-1) | Visual design systems — minimal, glass, brutalist, soft, neon, editorial, playful, corporate, aurora, 3D, bento, vertical-flavored |
| **Studio** | The visual builder where non-tech customers compose and edit their app |
| **Template Gallery** (200+ starters at year-1) | Pre-built complete starter apps to remix |

Plus rich asset libraries:
- **Section/block library** (500+ at year-1) — drag-into-Studio page sections
- **Animation preset library** (100+) — Framer Motion presets attachable to anything
- **3D scene library** (40+) — pre-built 3D scenes via React Three Fiber + Spline
- **Email templates** (50+), **form templates** (30+), **illustration packs** (8+), **background patterns** (30+), **admin layouts** (10+), **onboarding flows** (10+)

The combinatorial space is millions of unique app variations — but every variation is built from quality-controlled pre-built parts.

---

## How a Customer Builds an App (Step by Step)

This is the experience for a non-technical customer using B-Dash to create their own application. The whole flow is designed so a complete novice can produce a working, deployable app in under 30 minutes — and continue to refine it for months without writing any code.

### Step 1 — Tell us what you want, in one sentence

The customer types a single sentence describing their app:
- "I want a pizza shop with online ordering"
- "I'm a yoga teacher who needs class booking"
- "I need a portfolio for my design work"
- "I run a small clinic and need appointments"

The system matches this against a library of pre-built starter recipes using keyword analysis and phrase patterns. **No AI is required** — matching is fully deterministic, runs offline, and produces consistent results every time.

### Step 2 — Confirm the starting point

The system proposes the closest matching starter app and shows a **live preview** the customer can interact with. Three options:
- **Use this** — accept the starting point
- **Try another** — browse the next-best matches
- **Build from scratch** — pick modules à la carte (advanced)

### Step 3 — Answer guided questions, with previews

The customer is walked through 10 grouped phases of questions: brand & identity, look & feel, pages & sections, features, authentication, notifications, payments, integrations, operational settings, and legal/compliance.

**Every question offers four actions:**

| Action | What it does |
|---|---|
| **Pick** | Make a choice and move on |
| **Preview** | See exactly what the option looks like before deciding (live demos, screenshots, videos, color swatches, text samples, integration walkthroughs) |
| **Skip / Add Later** | Defer the question. The system uses a sensible default and adds the question to the post-generation Setup Tasks list. |
| **Recommend for me** | One-click apply the best default for this customer's archetype |

### Step 4 — Watch the app build in real time

A **live preview pane** on the right side of the screen shows the app updating as the customer answers. Colors apply instantly. Themes switch with smooth transitions. Sections appear and disappear based on choices. Tabs let them flip between Home, Login, Dashboard, Mobile view, and Dark mode previews.

### Step 5 — Generate the app

A summary screen shows the selected starter, theme, modules, and integrations. It also shows how many questions were deferred (e.g., "12 of 18 answered — 6 will be addressed later in Studio"). One click runs the generation pipeline (~30 seconds), deploys a preview URL for review, and packages the complete application as a downloadable zip.

### Step 6 — Address deferred items at any time

Skipped questions appear as **Setup Tasks** inside the generated app's visual builder (Studio):

- Each task shows the original question and what default is currently in use
- A **Configure** button opens the right panel (theme picker, payment setup, notification matrix, etc.)
- The customer addresses tasks at their own pace — pick a brand color today, set up payments next week, add WhatsApp notifications next month
- Tasks can be permanently dismissed if not needed
- Visual progress bar shows how much setup is complete

This means a customer is never blocked. They can ship a working app immediately with sensible defaults, then refine it as they learn what they actually need.

---

## Competitive Differentiation

| Feature | Webflow / Wix | Lovable / v0 / Bolt | Shopify | WordPress | **B-Dash** |
|---|---|---|---|---|---|
| Customer owns code | No | No | Limited | Yes | **Yes** |
| Visual builder for non-tech | Yes | Partial (chat) | Limited | Plugins | **Yes** |
| Variable cost per app | Hosting fees | LLM API calls | Transaction fees | Hosting | **None** |
| Works fully offline | No | No | No | Yes | **Yes** |
| AI dependency | None | Required | Optional | Optional | **Optional, BYO key** |
| Pre-built starter count | Many | None | Many | Themes | **Many (200+)** |
| Full backend control | No | Limited | Locked | Yes | **Yes** |
| Module composition system | No | No | No | Plugins (chaotic) | **Yes (curated)** |
| Free at scale | No | No | No | Yes (with tradeoffs) | **Yes** |

**The combination is unique**. No competitor offers all of: customer-owned code + zero variable cost + visual non-tech builder + curated modular composition + vast pre-built inventory.

---

## Business Model

Five potential revenue streams. Recommend starting with the first two.

| Model | Description | Phase |
|---|---|---|
| **Free core, premium themes/starters** | Base library free; designer themes and vertical starters paid one-time | From Phase 5 |
| **Premium support / managed hosting** | Optional managed hosting tier; or paid support packages | From Phase 9 |
| **White-label for agencies** | Branded version of B-Dash with concierge support, monthly subscription | After Studio mature |
| **Education / training** | Courses on building with B-Dash; certification program | Year 2+ |
| **Custom development** | We become the builder for customers who want fully managed delivery | Anytime |

Recommended starting model: free core + premium themes/starters. Adds white-label once Studio is mature. This keeps the wedge ("free or near-free + you own everything") intact while giving early monetization through optional add-ons.

---

## Cost Structure

What it costs to operate the platform:

| Cost category | Amount |
|---|---|
| Compute (per app generation) | **Zero** — runs locally / on customer infra |
| API spend (generator side) | **Zero** — no LLM calls, no third-party APIs |
| Hosting (your marketing site, optional managed tier) | Modest fixed cost |
| Storage (theme previews, starter live demos) | Modest |
| Maintenance | Time spent curating templates and updating dependencies |

**This is the structural advantage.** Every other player carries either LLM API cost (Lovable, v0) or recurring hosting cost (Webflow, Wix). B-Dash carries neither at the per-customer level.

For comparison:
- **Lovable** spends ~$0.50–$3 in LLM costs per app generated.
- **Webflow** spends ~$5–$50/month in hosting per active customer.
- **B-Dash** spends ~$0 per app generated.

This compounds: at 10,000 generations, Lovable spends $5,000–$30,000 in LLM costs. Webflow spends ~$60,000/month at 10,000 active sites. B-Dash spends ~$0 in either case.

---

## Roadmap (business view)

| Phase | Milestone | Customer-facing outcome | Time |
|---|---|---|---|
| 0 | Prove the architecture with one hand-built app | "It works, end to end" | ~2 days |
| 1 | First generation pipeline + 3 themes + restaurant vertical | First app generated from wizard answers | ~2 weeks |
| 2 | Two backend stacks proven on same contracts | Architecture validated for scale | ~2 weeks |
| 3 | Multi-channel notifications, multi-gateway payments, RBAC | Production-grade integrations | ~3 weeks |
| 4 | Studio v1 (visual builder) | Non-tech users can build and customize | ~2–3 months |
| 5 | 15 theme packs + 100 sections + 30 animations + 10 3D scenes + brand ingestion | "Looks great out of the box, lots of options" | ~2 months |
| 6 | Studio v2 (structural changes, visual data binding) | Customer can fully self-serve any change | ~1–2 months |
| 7 | Template Gallery (50 starters) | "Pick a template, customize, ship" | ~6 weeks |
| 8 | 100 modules online (productivity, content, social, tools) | Beyond business: any app | ~6 weeks |
| 9 | Telemetry, backups, multi-language polish, AI customer modules | Production-ready operational layer | ~4 weeks |
| 10 | Customization survival + version upgrade system | "Updates without losing your work" | ~3 weeks |
| 11 (year-1 finish) | Catalog reaches 60 themes, 200 starters, 250 modules, 500 sections | Mature product, full inventory | Ongoing |

**Total elapsed for v1 product**: roughly 9–12 months.
**First demoable thing**: 2 weeks.
**First commercially viable thing**: ~5 months (after Studio v1).
**Year-1 mature inventory**: ~12 months.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Template library curation becomes unsustainable | Quality drops, system unreliable | Curate aggressively — 50 great modules > 500 mediocre. Visual regression tests on every commit. |
| Studio is a 2–3 month build, may slip | Launch delayed | Ship operator-only v1 first; Studio is Phase 4 enhancement, not Phase 1 dependency |
| Contracts designed wrong | Templates won't compose | Spend disproportionate time on Phase 1; version everything; design contracts before implementations |
| Competitors copy "no variable cost" wedge | Loss of differentiation | Studio quality + theme breadth + curated inventory become the moat |
| Customers expect free everything | No revenue | Premium themes + agency white-label keep monetization clean without breaking the free wedge |
| Generated apps need bug fixes that customers can't apply | Support burden | Update/patch system from Phase 10; clear changelogs; safe-vs-risky categorization |
| Mobile performance with 3D / heavy animation | Poor UX | Every 3D component ships with a 2D fallback; performance budget enforced in CI |
| Asset library inconsistency (one ugly hero ruins trust) | Brand damage | Visual review checklist; designer sign-off on every shared asset; tokens-only styling |
| Section/block portability across themes fails | Sections break in some themes | Test every section against every theme automatically (cartesian product CI) |

---

## Success Metrics

| Phase milestone | What "success" looks like |
|---|---|
| End of Phase 1 | First end-to-end generated app, deployed live, working |
| End of Phase 3 | 3+ verticals generated, all integrations working |
| End of Phase 4 | Non-tech tester can build a working app in Studio in under 30 minutes |
| End of Phase 5 | Theme + asset wave 1 shipped; 15 themes feel cohesive and high-quality |
| End of Phase 7 | 50 starters in gallery; click-to-deploy under 5 minutes |
| End of year 1 | 60 themes, 200 starters, 250 modules; full visual builder; thriving operator/agency channel |
| 6 months post-launch | 1,000+ apps generated, NPS > 50 |
| 12 months post-launch | 10,000+ apps generated, agency partnerships, profitable on premium tier |

---

## Inventory at Year-1 Target

What customers see as "options available":

| Asset class | Count |
|---|---|
| Theme packs | 60+ |
| Complete starter apps | 200+ |
| Composable feature modules | 250+ |
| Drag-drop page sections | 500+ |
| Animation presets | 100+ |
| 3D scenes | 40+ |
| Hero pattern variants | 50+ |
| Pricing page variants | 15+ |
| Email templates | 50+ |
| Form templates | 30+ |
| Illustration style packs | 8+ |
| Background SVG patterns | 30+ |
| Admin/dashboard layouts | 10+ |
| Onboarding flow patterns | 10+ |
| Auth method variants | 17 |
| Languages (foundation strings) | 30+ |
| Payment gateway integrations | 16+ |
| Notification channel providers | 20+ |

Combinatorial space: practically unlimited unique app combinations.

---

## What We Need to Get Started

Decisions required before scaffolding begins:

1. First vertical for the spike *(recommend: restaurant — most features touched, fastest visual feedback)*
2. Default tech stack *(recommend: FastAPI + Next.js + Postgres + Tailwind + shadcn)*
3. Generator language *(recommend: Node.js — most templates touch JS frontends)*
4. First 3 theme packs *(recommend: Minimal, Glass, Aurora — covers neutral, premium, and motion-heavy ranges)*
5. Visual builder library *(recommend: Puck — modern, MIT-licensed, React-based)*
6. Repository structure *(recommend: monorepo via pnpm + Turborepo)*
7. First 5 starter recipes for the Gallery *(suggest: pizza-shop, doctor-clinic, personal-portfolio, todo-app, link-in-bio — covers archetypes)*
8. Default illustration packs *(recommend: unDraw, Storyset, hand-drawn — covers minimal, animated, and playful)*

Once these are confirmed, scaffolding can begin within hours of the next session.

---

## The Bottom Line

B-Dash combines four properties no single competitor offers: customer-owned code, zero variable cost, a visual builder for non-techies, and a vast curated inventory built on modular composition. It targets a real market gap between expensive agencies and locked-in DIY platforms, while the no-recurring-cost structure makes free-or-near-free pricing genuinely viable.

The biggest investment is Studio (2–3 months) and the catalog buildout (~year-1). The architectural foundation pays off across every customer segment because the same modules, themes, and asset libraries serve all of them.

The first commercially viable version is ~5 months out. The first demoable proof is 2 weeks. The right next step is to confirm the 8 open decisions and begin the Phase 0 spike.

---

*End of business plan. Companion technical detail in PLAN.md.*
